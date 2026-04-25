// SIDEBAR TOGGLE

function openSidebar() {
    var side = document.getElementById('sidebar');
    side.style.display = (side.style.display === "block") ? "none" : "block";
}
  
function closeSidebar() {
    document.getElementById('sidebar').style.display = 'none';
}
