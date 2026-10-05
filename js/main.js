// Entry point. The game is loaded dynamically so a failed three.js download
// (CDN / offline) can be reported instead of leaving a blank screen.
import('./app.js')
  .then(app => app.start())
  .catch(err => {
    console.error(err);
    document.getElementById('message').textContent = 'Nie udało się załadować biblioteki three.js.';
  });
