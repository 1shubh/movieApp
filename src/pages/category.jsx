import React, { useEffect, useState } from "react";
import useFetchData from "../usefetchData";
import { useNavigate, useParams } from "react-router-dom";
import { fetchMovieDetails } from "../fetchMovies";
import { MovieSkeletonCard } from "../components/MovieSkeletonCard";
import { MovieCard } from "../components/MovieCard";

export const Category = () => {
  const params = useParams();
  const { data, loading, error } = useFetchData(
    `content/categoryId/${params.id}`
  );
  const {
    data: category,
    loading: categoriesLoading,
    error: categoriesError,
  } = useFetchData(`categories/${params.id}`);
  const navigate = useNavigate();
  // const [data, setData] = useState([]);
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Update movies if data is empty or fetch movie details
  useEffect(() => {
    const fetchMoviesData = async () => {
      if (!data || data.length === 0) {
        setMovies([]); // Set movies to an empty array if data is empty
        setIsLoading(false); // Set loading state to false
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

  const handleRoute = (movieId) => {
    navigate(`/watch/${movieId}`);
  };

  if (isLoading || loading) return <MovieSkeletonCard />;
  if (error)
    return (
      <div className="min-h-[90vh]">
        <p className="text-center mt-10 text-xl text-white font-NBold">
          Sorry! Not found
        </p>
      </div>
    );

  return (
    <div className="mt-5 w-[80%] min-h-[100vh] m-auto">
      {!categoriesLoading && (
        <p className="text-xl font-NBold text-white">{category.name}</p>
      )}

      <div className="grid grid-cols-6 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-5 sm:grid-cols-3 xs:grid-cols-2 sm:w-[95%] gap-5">
        {movies.map((movie) => (
          <MovieCard {...movie} />
        ))}
      </div>
    </div>
  );
};
