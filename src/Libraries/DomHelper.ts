// interface for atrribute
interface InfAttribute {
  name: string;
  value: string;
}
/**
 * @description Dom related operation functions
 */
export default class DomHelper {
  /**
   * @description to create dom element
   * @param {string} type type of tag to create
   * @param {string} className
   * @param {InfAttribute[]} attributes
   */
  public static createElement(
    type: string, className: string , attributes?: InfAttribute[],
  ): HTMLElement {
    const element = document.createElement(type);
    element.className  += " " + className;
    if (attributes) {
      for ( const attribute of attributes) {
        element.setAttribute(attribute.name, attribute.value);
      }
    }
    return element;
  }
  /**
   * @descriptionto append child/children dom to parent dom
   * @param {HTMLElement} parent
   * @param {HTMLElement | HTMLElement[]} child child or collection child dom
   */
  public static append( parent: HTMLElement, child: HTMLElement | HTMLElement[]): HTMLElement {
    if ( Array.isArray(child) ) {
      parent.append(...child);
    } else {
      parent.appendChild(child);
    }
    return parent;
  }
  /**
   * @descriptionto remove child dom to parent dom
   * @param {HTMLElement} parent
   * @param {HTMLElement } child child dom
   */
  public static remove( parent: HTMLElement, child: HTMLElement ): HTMLElement {
    parent.removeChild(child);
    return parent;
  }
  /**
   * @descriptionto append string type html
   * @param {HTMLElement} parent
   * @param {string} html
   */
  public static appendHtml(parent: HTMLElement, html: string): HTMLElement {
    parent.innerHTML = html;
    return parent;
  }
  /**
   * @description to add event listeners
   * @param {string} type name of event
   * @param {HTMLElement} el
   * @param {EventListener} callback
   */
  public static addEventListener(type: string, el: HTMLElement, callback: EventListener | any): HTMLElement {
    type.split(",").forEach(t => {
      el.addEventListener(t, callback.bind(this,t));
    })
    return el;
  }
  /**
   * @description to remove event listeners
   * @param {string} type name of event
   * @param {HTMLElement} el
   * @param {EventListener} callback
   */
  public static removeEventListener(type: string, el: HTMLElement, callback: EventListener): HTMLElement {
    el.removeEventListener(type, callback);
    return el;
  }
  /**
   * @description to add class
   * @param {HTMLElement} el
   * @param {string | string[]} classNames
   */
  public static addClass(el: HTMLElement, classNames: string | string[]) {
    if( Array.isArray(classNames) ){
      for ( const className of classNames) {
        el.classList.add(className);
      }
    }else {
      el.classList.add(classNames);
    }
    return el;
  }
  /**
   * @descriptionto remove class
   * @param {HTMLElement} el
   * @param {string | string[]} classNames
   */
  public static removeClass(el: HTMLElement, classNames: string | string[]) {
    if(!el) return null;
    if( Array.isArray(classNames) ){
      for ( const className of classNames) {
        el.classList.remove(className);
      }
    }else {
      el.classList.remove(classNames);
    }
    return el;
  }
  /**
   * @descriptionto checking class present
   * @param {HTMLElement} el
   * @param {string} classNames
   * @retrun {boolean}
   */
  public static hasClass(el: HTMLElement, classNames: string ):boolean {
    return el.classList.contains(classNames);
  }
  /**
   * @descriptionto checking class present
   * @param {HTMLElement} el
   * @param {string} classNames
   * @retrun {HTMLElement}
   */
  public static toggleClass(el: HTMLElement, classNames: string ):HTMLElement {
    el.classList.toggle(classNames);
    return el;
  }
}
