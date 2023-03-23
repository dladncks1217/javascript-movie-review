import { SCORE_DATA_TEXT } from '../util/constants';
import { $ } from '../util/querySelector';
import { MovieItem } from './MovieItem';
import movieModal from './MovieModal';
import movieSkeleton from './MovieSkeleton';

const SKELETON_ITEM_COUNT = 20;

class Main {
  #element;
  #manager;

  constructor(element, manager) {
    this.#element = element;
    this.#manager = manager;

    this.#requestMovieListEvent();
    this.#addModalEvent();
    this.#element.innerHTML = `
    <h2></h2>
    <ul class="item-list"></ul>
    `;
  }

  renderSkeleton(element) {
    const query = this.#manager.getQuery();

    $('h2', element).innerHTML =
      query === '' ? '지금 인기 있는 영화' : `"${query}" 검색 결과`;
    $('ul', element).appendChild(document.createElement('div'));

    const skeletonElement = $('ul', element).lastElementChild;
    skeletonElement.outerHTML = movieSkeleton().repeat(SKELETON_ITEM_COUNT);
  }

  async render() {
    const query = this.#manager.getQuery();

    if (query === '' && !this.#manager.getMovieList().length) {
      this.renderSkeleton(this.#element);
      await this.#manager.searchMovieList('');
    } else if (this.#manager.getCurrentPage() === 1) {
      this.renderSkeleton(this.#element);
      await this.#manager.searchMovieList(query);
    }

    const movieListData = this.#manager.getMovieList();

    this.#element.innerHTML = `
    <h2>${query === '' ? '지금 인기 있는 영화' : `"${query}" 검색 결과`}</h2>
    <ul class="item-list"> </ul>
    
    `;

    if (this.#manager.isLastPage()) {
      $('.btn.primary.full-width').classList.add('hidden');
    }

    if (movieListData.length) {
      movieListData.forEach((data) => {
        MovieItem($('ul', this.#element), data);
      });
    } else {
      const tempElement = document.createElement('div');
      tempElement.className = 'temp';
      $('ul.item-list').appendChild(tempElement);
      $('.temp').outerHTML = '<p>검색 결과가 없습니다.</p>';
    }
  }

  #requestMovieListEvent() {
    const observer = new IntersectionObserver(async (e) => {
      this.renderSkeleton(this.#element);
      await this.#manager.getMoreMovieList();
      this.render();
    });
    observer.observe($('.btn.primary.full-width'));
    this.#element.addEventListener('click', async (e) => {
      if (e.target.tagName === 'IMG') {
        const movieData = this.#manager.getMovieData(e.target.alt);
        const movieStar = this.#manager.getStarData()[movieData.id];
        $('.modal').innerHTML = movieModal(
          movieData,
          this.#manager.getGenreData(),
          !movieStar ? 0 : movieStar
        );
        $('.modal').classList.remove('hidden');
        $('.modal-background').classList.remove('hidden');
        this.#drawStar();
      }
    });
  }

  #addModalEvent() {
    $('.modal').addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON') {
        this.#saveStarData();
        $('.modal-container').remove();
        $('.modal').classList.add('hidden');
        $('.modal-background').classList.add('hidden');
      }
    });
    $('.modal-background').addEventListener('click', () => {
      this.#saveStarData();
      $('.modal-container').remove();
      $('.modal').classList.add('hidden');
      $('.modal-background').classList.add('hidden');
    });
    document.addEventListener('keyup', (e) => {
      if (
        (e.key === 'Escape' || e.key === 'Backspace') &&
        !$('.modal.hidden')
      ) {
        $('.modal-container').remove();
        $('.modal').classList.add('hidden');
        $('.modal-background').classList.add('hidden');
      }
    });
  }

  #drawStar() {
    $('.star input').addEventListener('input', (e) => {
      const nowStarData = $('.star input');
      $('.star span').style.width = `${e.target.value * 20}%`;
      $('#star-data').textContent = `${nowStarData.value * 2}점`;
      $('#star-text').textContent = SCORE_DATA_TEXT[nowStarData.value * 2];
    });
  }

  #saveStarData() {
    const resultStar = Number($('#star-data').textContent.split('점')[0]);
    const movieName = $('#movie-name').textContent;
    const movieId = this.#manager.getMovieData(movieName).id;
    this.#manager.setStarData(movieId, resultStar);
  }
}

export default Main;
