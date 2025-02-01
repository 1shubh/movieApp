import React,{useState,useEffect} from "react";
import useFetchData from "../usefetchData";
import { fetchMovieDetails } from "../fetchMovies";
import { useNavigate } from "react-router-dom";
import { MovieSkeletonCard } from "../components/MovieSkeletonCard";
import { MovieCard } from "../components/MovieCard";

export const EditMovie = () => {
  const { data, loading, error } = useFetchData("content");
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchMoviesData = async () => {
      if (!data || data.length === 0) {
        setMovies([]); // Set movies to an empty array if data is empty
        // setIsLoading(false); // Set loading state to false
        return;
      }
      const results = await Promise.all(
        data.map(async (movie) => {
          try {
            const details = await fetchMovieDetails(
              movie?.movieId,
              setIsLoading,
              (movieDetails) => {
                // Process the movie details here, such as storing in state or other actions
              },
              movie?.type, // Pass type as part of the fetch call
              movie?.season
            );
            return details ? { ...movie, tmdbDetails: details } : movie;
          } catch (err) {
            console.error(
              `Error fetching movie details: ${movie?.movieId}`,
              err
            );
            return movie;
          }
        })
      );

      // Sort movies by release_date (latest first)
      const sortedMovies = results.sort((a, b) => {
        const dateA = new Date(
          a.tmdbDetails?.release_date || a.tmdbDetails?.air_date || "1970-01-01"
        );
        const dateB = new Date(
          b.tmdbDetails?.release_date || b.tmdbDetails?.air_date || "1970-01-01"
        );
        return dateB - dateA; // Sort descending
      });
      setMovies(sortedMovies);
      setIsLoading(false);
    };
    fetchMoviesData();
  }, [data]);

  if (isLoading) return <MovieSkeletonCard />;
  if (error) return <div className="h-[100vh]">Error: {error.message}</div>;

  return (
    <div className="py-5 w-[80%] xl:w-[90%] min-h-[100vh] m-auto">
      {/* <p className="text-xl font-NBold text-white">New Release</p> */}
      <div className="grid grid-cols-6 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-3 xs:grid-cols-2 sm:w-[95%] gap-5">
        {movies.map((movie) => (
          <MovieCard {...movie} />
        ))}
      </div>
    </div>
  );
};
