const DEFAULT_THEME = "default"

function loadTheme() {
    var link  = document.createElement('link')
    link.id   = "theme";
    link.rel  = 'stylesheet'
    link.type = 'text/css'
    link.href = 'themes/' + themeName + '/style.css'
    link.media = 'all'
    document.head.appendChild(link);
}

window.onload = function() {
    themeName = localStorage.getItem("themeName") || DEFAULT_THEME
    loadTheme()
}
