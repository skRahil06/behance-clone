var apiKey = '1W3vpKx6ZFQaebogmUbdlmtlv4H1GbGBgh84Ff3CINw';
var currentPage = 1;
var currentSortOption = 'latest';

function loadImages(page = 1, query = "") {
    var container = document.getElementById("imageContainer");
    var unsplashUrl;

    if (query.trim() !== "") {
        unsplashUrl = `https://api.unsplash.com/search/photos/?page=${page}&query=${encodeURIComponent(query)}&client_id=${apiKey}&order_by=${currentSortOption}`;
    } else {
        unsplashUrl = `https://api.unsplash.com/photos/?page=${page}&client_id=${apiKey}&order_by=${currentSortOption}`;
    }

    function appendImages(data) {
        data.forEach(item => {
            var imageItem = document.createElement("div");
            imageItem.className = "image-item";

            var img = document.createElement("img");
            img.src = item.urls.regular;
            img.alt = "Unsplash Image";

            var likeButton = document.createElement("button");
            likeButton.className = "like-button";
            likeButton.innerHTML = "&#x2661;";
            likeButton.addEventListener("click", function() {
                this.classList.toggle("clicked");
            });

            img.addEventListener("click", function() {
                openLightbox(item.urls.full, item.alt_description);
                loadSimilarImages(item.id);
            });

            imageItem.appendChild(img);
            imageItem.appendChild(likeButton);
            container.appendChild(imageItem);
        });
    }

    fetch(unsplashUrl)
        .then(response => response.json())
        .then(data => {
            if (page === 1) {
                container.innerHTML = "";
            }

            const results = data.results || data;
            appendImages(results);

            var observer = new IntersectionObserver(function(entries, observer) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        loadImages(page + 1, query);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            observer.observe(container.lastElementChild);
        })
        .catch(error => console.error('Error fetching images:', error));
}

function handleSortChange() {
    var sortOptions = document.getElementById("sort-options");
    currentSortOption = sortOptions.value;
    loadImages(1, "", currentSortOption);

    var sortIcon = document.getElementById("sort-icon");
    sortIcon.style.opacity = 0.5;
}

function openLightbox(imageUrl, imageTitle) {
    var body = document.body;
    var lightbox = document.getElementById("lightbox");
    var lightboxImg = document.getElementById("lightboxImg");
    var lightboxImageTitle = document.getElementById("lightboxImageTitle");

    lightboxImg.src = imageUrl;
    lightboxImageTitle.innerText = imageTitle || "";

    body.classList.add("lightbox-open");
    lightbox.classList.add("open");
}

function closeLightbox() {
    var body = document.body;
    var lightbox = document.getElementById("lightbox");

    body.classList.remove("lightbox-open");
    lightbox.classList.remove("open");
}

function loadSimilarImages(photoId) {
    // ... (rest of your JavaScript code for loading similar images) ...
}

function searchImages() {
    var query = document.getElementById("search-bar").value;
    if (query.trim() !== "") {
        loadImages(1, query);
    }
}

document.getElementById("search-bar").addEventListener("input", function() {
    var query = this.value;
    if (query.trim() !== "") {
        fetchAutocompleteSuggestions(query);
    } else {
        document.getElementById("autocomplete-dropdown").innerHTML = "";
    }
});

document.addEventListener("click", function(event) {
    if (!event.target.closest("#search-bar-container")) {
        document.getElementById("autocomplete-dropdown").innerHTML = "";
    }
});

function fetchAutocompleteSuggestions(query) {
    var autocompleteDropdown = document.getElementById("autocomplete-dropdown");
    autocompleteDropdown.innerHTML = "";

    fetch(`https://api.unsplash.com/search/photos/?query=${encodeURIComponent(query)}&client_id=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            if (data.results) {
                data.results.slice(0, 5).forEach(item => {
                    var suggestionItem = document.createElement("div");
                    suggestionItem.className = "autocomplete-item";
                    suggestionItem.innerText = item.alt_description || "Untitled";
                    suggestionItem.addEventListener("click", function() {
                        document.getElementById("search-bar").value = this.innerText;
                        searchImages();
                        autocompleteDropdown.innerHTML = "";
                    });
                    autocompleteDropdown.appendChild(suggestionItem);
                });
            }
        })
        .catch(error => console.error('Error fetching autocomplete suggestions:', error));
}

document.getElementById("search-button").addEventListener("click", searchImages);

document.getElementById("search-bar").addEventListener("keyup", function(event) {
  if (event.key === "Enter") {
    searchImages();
  }
});

document.getElementById("sort-options").addEventListener("change", handleSortChange);

loadImages();
