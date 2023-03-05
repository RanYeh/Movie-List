console.clear()

//--Global Varibles
const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = []
let filteredMovies = []
let currentPage = 1
let currentMode = 'mode-card'

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const modeBox = document.querySelector('#mode-box')


//-- Render Movie List
axios.get(INDEX_URL)
  .then(response => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(currentPage))
    // console.log(movies)
  })
  .catch(err => console.log(err))


//-- Event Listeners
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))

  if (filteredMovies.length === 0) {
    return alert('Cannot find movies with keyword: ' + keyword)
  }

  renderMovieList(getMoviesByPage(currentPage))
  renderPaginator(filteredMovies.length)
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  currentPage = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(currentPage))
})

modeBox.addEventListener('click', function onModeBoxClicked(event) {
  if (event.target.matches('.mode')) {
    currentMode = event.target.id
    switchPanelMode(currentMode)
  }
})


//-- Functions
function renderMovieList(data) {
  let rawHTML = ''

  if (currentMode === 'mode-card') {
    data.forEach(item => {
      // title, image
      rawHTML += `
        <div class="col-sm-3">
          <div class="mb-2">
            <div class="card">
              <img
                src=${POSTER_URL + item.image}
                class="card-img-top"
                alt="Movie Poster"
              >
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <div class="card-footer">
                <button
                  class="btn btn-primary btn-show-movie"
                  data-bs-toggle="modal"
                  data-bs-target="#movie-modal"
                  data-id="${item.id}"
                >
                  More
                </button>
                <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
              </div>
            </div>
          </div>
        </div>
      `
    })
  } else if (currentMode === 'mode-list') {
    rawHTML += `<ul class="list-group mb-3">`

    data.forEach(item => {
      rawHTML += `
        <li class="list-group-item d-flex justify-content-between align-items-center p-3">
          <h5 class="card-title">${item.title}</h5>
          <div>
            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal"
              data-id="${item.id}">More</button>
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </div>
        </li>
      `
    })

    rawHTML += `</ul>`
  }

  dataPanel.innerHTML = rawHTML
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
      <li class="page-item"><a class="page-link" href="#" data-page=${page}>${page}</a></li>
    `
  }

  paginator.innerHTML = rawHTML
}

function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies

  startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id)
    .then(response => {
      const data = response.data.results
      modalTitle.innerText = data.title
      modalDate.innerText = 'Release date: ' + data.release_date
      modalDescription.innerText = data.description
      modalImage.innerHTML = `<img src=${POSTER_URL + data.image} alt="movie-poster" class="img-fluid">`
    })
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find(movie => movie.id === id)

  // 檢查重複
  if (list.some(movie => movie.id === id)) {
    return alert('This movie is already in your favorite!')
  }

  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

function switchPanelMode(mode) {
  const modeCard = modeBox.children[0]
  const modeList = modeBox.children[1]

  if (mode === 'mode-card') {
    modeList.classList.remove('active')
    modeCard.classList.add('active')
  } else if (mode === 'mode-list') {
    modeList.classList.add('active')
    modeCard.classList.remove('active')
  }

  renderMovieList(getMoviesByPage(currentPage))
}
