// script.js
window.onload = function () {
    const urlParams = new URLSearchParams(window.location.search);
    const college = urlParams.get('college');
    const semester = urlParams.get('semester');
    const branch = urlParams.get('branch');
  
    fetch('data.json')
      .then(response => response.json())
      .then(data => {
        const filteredData = data.filter(item =>
          item.college === college &&
          item.semester === semester &&
          item.branch === branch
        );
  
        const resultsContainer = document.getElementById('results');
        resultsContainer.innerHTML = '';
  
        if (filteredData.length > 0) {
          filteredData.forEach(item => {
            const resultCard = `
              <div class="rounded-lg border bg-gray-900 text-white p-4 shadow-sm">
                <h3 class="text-2xl font-bold mb-2">${item.subject}</h3>
                <p class="mb-2">PDF: <a href="${item.pdfUrl}" class="text-blue-400" target="_blank">Download</a></p>
                <p class="mb-2">Chapter 1 <a href="${item.chap1}" class="text-blue-400" target="_blank">Download</a></p>
                <p class="mb-2">Chapter 2 <a href="${item.chap2}" class="text-blue-400" target="_blank">Download</a></p>
                <p class="mb-2">Chapter 3 <a href="${item.chap3}" class="text-blue-400" target="_blank">Download</a></p>
                <p class="mb-2">Chapter 4 <a href="${item.chap4}" class="text-blue-400" target="_blank">Download</a></p>
                <p class="mb-2">Chapter 5 <a href="${item.chap5}" class="text-blue-400" target="_blank">Download</a></p>
                <p>YouTube Playlist: <a href="${item.youtubePlaylist}" class="text-blue-400" target="_blank">Watch</a></p>
              </div>`;
            resultsContainer.innerHTML += resultCard;
          });
        } else {
          resultsContainer.innerHTML = '<p>No resources found for the selected criteria.</p>';
        }
      });
  };
  