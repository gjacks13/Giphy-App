let giphySearch = {
  host: 'api.giphy.com',
  apiKey: 'mQxzrgSvJ9MH7cYMtMgDi9pOMCxmcXoK',
  maxResultCount: 10,
  topics: ['cat', 'party', 'OMG'],
  resultSet: [],
  gifClickHandler: null,
  init: function() {
      this.resultSet = [];
      
      // populate initial buttons set
      this.topics.forEach(searchTerm => {
        this.addSearchTerm(searchTerm);
      });
      
      // set listeners
      this.setInitListeners();
  },
  searchTermExists: function(searchTerm) {
    if (this.topics.indexOf(searchTerm) > -1) {
      return true;
    } else {
      return false;
    }
  },
  addSearchTerm: function(searchTerm) {
    let searchBtn = document.createElement('button');
    searchBtn.textContent = searchTerm;
    searchBtn.classList.add('panel__filter-btn');
    searchBtn.classList.add('panel__filter-btn--blue');

    document.getElementById('panel-filter').appendChild(searchBtn);
  },
  searchGifs: function(searchTerm) {
    // return if empty string is passed
    if (searchTerm === '') {
      this.displayAlert('Please input a topic to search.');
      return;
    }
    
    // reset results
    this.resetResults();

    // add search term
    if (!this.searchTermExists(searchTerm)) {
      this.addSearchTerm(searchTerm);
      this.topics.push(searchTerm);
    }

    $.ajax({
      context: this,
      method: 'GET',
      url: `https://${this.host}/v1/gifs/search?api_key=${this.apiKey}&q=${searchTerm}&limit=${this.maxResultCount}`
    }).done(function(response) {
      let context = this;
      this.displayResultSet(response);
    }).fail(function(response) {
      this.displayAlert('The search yielded no results. Wanna try again? :-(');
    });
  },
  displayResultSet: function(data) {
    this.resultSet = data['data'];

    this.resultSet.forEach((gif) => {
      if (gif['type'] === 'gif') {
        let gifContainer = document.createElement('div');
        gifContainer.classList.add('panel__gif-cont');

        let stillGif = gif['images']['fixed_height_still']['url'];
        let gifElem = document.createElement('img');
        gifElem.classList.add('panel__gif-cont__gif');
        gifElem.setAttribute('alt', gif['title']);
        gifElem.setAttribute('src', stillGif);
        gifElem.setAttribute('display', 'inline-block');

        // set data attributes
        gifElem.setAttribute('data-still', stillGif);
        gifElem.setAttribute('data-animate', gif['images']['fixed_height']['url']);
        gifElem.setAttribute('data-rating', gif['rating']);
        gifElem.setAttribute('data-is-animated', 'false');

        // append gif to results
        gifContainer.appendChild(gifElem);
        document.getElementById('panel-results').appendChild(gifContainer);
      }
    });

    // set click listeners
    this.setGifHandlers();
  },
  setGifHandlers: function() {
    this.gifClickHandler = this.handleGifClick.bind(this);
    document.getElementById('panel-results').addEventListener('click', this.gifClickHandler);
  },
  removeGifHandlers: function() {
    document.getElementById('panel-results').removeEventListener('click', this.gifClickHandler);
  },
  handleGifClick: function(e) {
    let clickedElem = e.target;
    if (clickedElem.className === 'panel__gif-cont'
        || clickedElem.className === 'panel__gif-cont__gif') {
        if (clickedElem.className === 'panel__gif-cont') {
          let gifElem = clickedElem.firstElementChild;
          this.isAnimated(gifElem) ? this.stopGif(gifElem) : this.animateGif(gifElem);
        } else if (clickedElem.className === 'panel__gif-cont__gif') {
          this.isAnimated(clickedElem) ? this.stopGif(clickedElem) : this.animateGif(clickedElem);
        }
    }
  },
  handleSubmitClick: function(e) {
    e.preventDefault();
    let searchBox = document.getElementById('search-box');
    let searchTerm = searchBox.value;
    if (searchTerm !== '' && searchTerm !== undefined) {
      this.searchGifs(searchTerm);
    }
  },
  handleTopicClick: function(e) {
    let clickedElem = e.target;
    if (clickedElem.className.includes('panel__filter-btn')) {
      this.searchGifs(clickedElem.innerText);
    }
  },
  isAnimated(gifElem) {
    if (gifElem.className === 'panel__gif-cont') {
      return gifElem.firstElementChild.getAttribute('data-is-animated') === 'true' ? true : false;
    } else if (gifElem.className === 'panel__gif-cont__gif') {
      return gifElem.getAttribute('data-is-animated') === 'true' ? true : false;
    } else {
      return false;
    }
  },
  animateGif: function(gifElem) {
    if (gifElem.className === 'panel__gif-cont') {
      this.setAnimateState(gifElem.firstElementChild, 'true');
      gifElem.firstElementChild.getAttribute('src') = gifElem.firstElementChild.getAttribute('data-animate');
    } else if (gifElem.className === 'panel__gif-cont__gif') {
      this.setAnimateState(gifElem, 'true');
      gifElem.setAttribute('src', gifElem.getAttribute('data-animate'));
    }
  },
  stopGif: function(gifElem) {
    if (gifElem.className === 'panel__gif-cont') {
      this.setAnimateState(gifElem.firstElementChild, 'false');
      gifElem.firstElementChild.getAttribute('src') = gifElem.firstElementChild.getAttribute('data-still');
    } else if (gifElem.className === 'panel__gif-cont__gif') {
      this.setAnimateState(gifElem, 'false');
      gifElem.setAttribute('src', gifElem.getAttribute('data-still'));
    }
  },
  stopAllGifs: function() {
    gifs = document.getElementsByClassName('panel__gif-cont__gif');
    if (gifs.length > 0) {
      [].forEach.call(gifs, gif => {
        this.stopGif(gif);
      });
    }
  },
  removeAllGifs: function() {
    document.getElementById('panel-results').innerHTML = '';
  },
  setAnimateState: function(gifElem, state) {
    if (state === 'true') {
      gifElem.setAttribute('data-is-animated', 'true');
    } else {
      gifElem.setAttribute('data-is-animated', 'false');
    }
  },
  setInitListeners: function() {
    document.getElementById('panel-filter').addEventListener('click', this.handleTopicClick.bind(this));
    document.getElementById('submit-btn').addEventListener('click', this.handleSubmitClick.bind(this));
  },
  resetResults: function() {
    this.stopAllGifs();
    this.removeAllGifs();
    this.removeGifHandlers();
  },
  displayAlert: function(msg) {
    vex.dialog.alert({
      message: msg
    });
  }
};

giphySearch.init();