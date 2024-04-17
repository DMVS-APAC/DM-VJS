<?php
// Set HTTP Content-Type header to application/json
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");

require __DIR__ . '/../../../vendor/autoload.php';

// Specify the path to the directory containing your .env file
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../..');

// Load the environment variables
$dotenv->load();

define("API_KEY", $_ENV["API_KEY"]);
define("API_SECRET", $_ENV["API_SECRET"]);
const DAILYMOTION_API_BASE_URL = "https://partner.api.dailymotion.com";
const DAILYMOTION_API_METADATA = "https://www.dailymotion.com/player/metadata/video";

$allowedStrings = $_ENV["ALLOWED_DOMAIN"];
$allowedDomains = explode(",", $allowedStrings);

$referer = $_SERVER['HTTP_REFERER'] ?? '';

if (isset($_SERVER['HTTP_REFERER'])) {
    $referer = $_SERVER['HTTP_REFERER'];
    $allowed = false;

    foreach ($allowedDomains as $domain) {
        if (strpos($referer, $domain) !== false) {
            $allowed = true;
            break;
        }
    }

    if (!$allowed) {
        header('HTTP/1.1 403 Forbidden');
        echo json_encode([
            "title" => "Access Forbidden",
            "message" => "You don't have permission to access this resource.",
            "allowed" => $allowedDomains
        ]);
        die(); // Or handle the unauthorized access as needed
    }
}

$videoId = isset($_GET['videoid']) ? htmlspecialchars($_GET['videoid']) : '';

if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
    $clientIp = $_SERVER['HTTP_CLIENT_IP'];
} elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
    $clientIp = $_SERVER['HTTP_X_FORWARDED_FOR'];
} else {
    $clientIp = ( $_SERVER['REMOTE_ADDR'] == '127.0.0.1') ? $_ENV['LOCAL_IP'] : $_SERVER['REMOTE_ADDR'];
//    $clientIp = $_SERVER['REMOTE_ADDR'];
}

$videoFormats = isset($_GET['videoformats']) ? htmlspecialchars($_GET['videoformats']) : 'stream_live_hls_url';

if ($videoId == '') {
    header('HTTP/1.1 403 Forbidden');
    echo json_encode([
        "title" => "Access Forbidden",
        "message" => "Video ID is required.",
    ]);
    die();
}

function auth() {
    $authUrl = DAILYMOTION_API_BASE_URL . "/oauth/v1/token";
    $ch = curl_init($authUrl);

    curl_setopt_array(
        $ch,
        [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => [
                "scope"=>"read_video_streams",
                "grant_type"=> "client_credentials",
                "client_id" => API_KEY,
                "client_secret" => API_SECRET,
            ],
            CURLOPT_TIMEOUT => 2,
            CURLOPT_RETURNTRANSFER => true,
        ]
    );

    $response = curl_exec($ch);

    curl_close($ch);

    return json_decode($response, true);
}

function fetchStreamUrls(string $videoId, string $clientIp, string $videoFormats= "stream_live_hls_url"): string {
    // Initialize a single cURL session
    $curl = curl_init();

    /**
     * Checking the content restriction
     *
     * Every restricted content has `error` field
     *
     * Private content json result
     * ```json
     * {
     *      "title": "Konten pribadi.",
     *      "message": "Maaf, kami tidak dapat menampilkan konten ini karena telah ditandai sebagai 'milik pribadi' oleh penulisnya.",
     *      "raw_message": "Maaf, kami tidak dapat menampilkan konten ini karena telah ditandai sebagai 'milik pribadi' oleh penulisnya.",
     *      "code": "DM010",
     *      "status_code": 403,
     *      "refresh": 0
     * }
     * ```
     *
     * Password protected json result
     * ```json
     * {
     *      "more_info": "https:\/\/developer.dailymotion.com\/api#error-codes",
     *      "code": "403",
     *      "message": "This user does not have access to the video. He must provide a password",
     *      "type": "password_protected",
     *      "error_data":
     *          {
     *              "reason": "video_password_protected"
     *          }
     * }
     * ```
     *
     * Geo allowed json result
     * ```json
     * {
     *      "title": "Video dibatasi geo oleh pengguna.",
     *      "message": "Cari \"<a target=\"_top\" href=\"\/search\/Cerita%20singkat%20keseruan%20closing%20party%20bersama%20volunteer%20surabayadev%20pada%20hari%20Minggu%2028%20November%202021.%20Yuk%20ikutan%20keseruan%20kami%20lainnya%20dan%20jangan%20lupa%20follow%20akun%20surabayadev%20yaa%20%E2%98%BA%23VolunteerSurabayadev2021%20%23SurabayaDev2021%20%23surabayadev\" class=\"highlight\">Cerita singkat keseruan closing party bersama volunteer surabayadev pada hari Minggu 28 November 2021. Yuk ikutan keseruan kami lainnya dan jangan lupa follow akun surabayadev yaa \u263a#VolunteerSurabayadev2021 #SurabayaDev2021 #surabayadev<\/a>\" atau temukan video lainnya di <a target=\"_top\" href=\"\/\" class=\"highlight\">Dailymotion<\/a>.",
     *      "raw_message": "Cari \"Cerita singkat keseruan closing party bersama volunteer surabayadev pada hari Minggu 28 November 2021. Yuk ikutan keseruan kami lainnya dan jangan lupa follow akun surabayadev yaa \u263a#VolunteerSurabayadev2021 #SurabayaDev2021 #surabayadev\" atau temukan video lainnya di Dailymotion.",
     *      "code":"DM007",
     *      "status_code":403,
     *      "refresh":0
     * }
     * ```
     *
     */
    curl_setopt_array(
        $curl,
        [
            CURLOPT_TIMEOUT => 2,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_URL => DAILYMOTION_API_METADATA . "/" . $videoId,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json']
        ]
    );

    $jsonVideoMetadata = curl_exec($curl);
    $videoMetadata = json_decode($jsonVideoMetadata);

    if ( isset($videoMetadata->error) ) {
        $errorJson = new stdClass();

        // It's only handle for private and geo blocked content
        if ( isset($videoMetadata->error->status_code) && $videoMetadata->error->status_code === 403 ) {
            header('HTTP/1.1 403 Forbidden');
            $errorJson->title = $videoMetadata->error->title;
            $errorJson->message = $videoMetadata->error->raw_message;
        }

        // If the video is password protected, the json value is little different with private and ge blocked
        if ( $videoMetadata->error->code == 403 ) {
            header('HTTP/1.1 403 Forbidden');
            $errorJson->title = $videoMetadata->error->type;
            $errorJson->message = $videoMetadata->error->message;
        }

        curl_close($curl);
        return json_encode($errorJson);
    }

    // Generate token first before generate stream URL
    $reqToken = auth();
    if (isset($reqToken["error"])) return json_encode($reqToken);

    curl_setopt_array(
        $curl,
        [
            CURLOPT_HTTPHEADER => ["authorization: Bearer " . $reqToken["access_token"]],
            CURLOPT_TIMEOUT => 2,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_URL => DAILYMOTION_API_BASE_URL . "/rest/video/{$videoId}"
                . "?client_ip=$clientIp"
                . "&fields={$videoFormats}"
        ]
    );

    $response = curl_exec($curl);
    curl_close($curl);

    $json_array = json_decode($response);
    if (isset($_ENV['ENV']) && $_ENV['ENV'] === "development") {
        $json_array->client_ip = $clientIp;
    }

    return json_encode($json_array);
}

echo fetchStreamUrls($videoId, $clientIp, $videoFormats);
