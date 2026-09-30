export const THEME_KEY = "stablesave:theme";

/** Runs in <head> before paint so the saved theme never flashes. */
export const themeScript = `try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;
