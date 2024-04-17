
export function fetchData(endpoint: string): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(endpoint)
      const data = await response.json()

      /**
       * Only HTTP 200 is regarded as successful response
       */
      if (response.status === 200) {
        resolve(data)
      } else {
        reject({
            status: response.status,
            title: data.title,
            message: data.message
        })
      }
    } catch (error) {
        // Handles network errors, fetch exceptions, and JSON parsing errors
        reject({
          status: 'Network or parsing error',
          message: error.message || 'Error fetching or parsing response'
        });
      }
  })
}
