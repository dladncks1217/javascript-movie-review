import { Movie } from "../type/movie";

const getPopolarMovieRequestUrl = (page = 1) => (
  `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.API_KEY}&language=ko-KR&page=${page}`
);

const getSearchMovieUrl = (query: string, page = 1) => (
  `https://api.themoviedb.org/3/search/movie?api_key=${process.env.API_KEY}&language=ko-KR&query=${query}&page=${page}&include_adult=false`
);

class MovieListManager {
  private query: string = "";
  private list: Movie[] = [];
  private currentPage: number = 1;
  private lastPage = false;

  getMovieList() {
    return this.list.map((movie) => ({ ...movie }));
  }   

  getQuery() {
    return this.query;
  }

  isLastPage() {
    return this.lastPage;
  }

  async fetchMovieList() {
    const url = this.query === "" 
      ? getPopolarMovieRequestUrl(this.currentPage)
      : getSearchMovieUrl(this.query, this.currentPage);

    await fetch(url)
      .then((res) => res.json())
      .then((data) => {
        this.list.push(...data.results);
        if (data["total_results"] === this.list.length) this.lastPage = true;
        else this.lastPage = false;
      })
      .catch(() => alert('정보 요청에 실패했습니다.'));
  }

  async searchMovieList(movieName:string){
    this.query = movieName;
    this.currentPage = 1;
    this.list = [];
    await this.fetchMovieList();
  }

  async getMoreMovieList () {
    this.currentPage += 1;
    await this.fetchMovieList();
  }
}

export default MovieListManager;
