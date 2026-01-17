-- Supabase function for vector similarity search on circulars

CREATE OR REPLACE FUNCTION match_circulars(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  filter_language text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  source text,
  raw_text text,
  language text,
  published_date date,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    circulars.id,
    circulars.title,
    circulars.source,
    circulars.raw_text,
    circulars.language,
    circulars.published_date,
    1 - (circulars.embedding <=> query_embedding) AS similarity
  FROM circulars
  WHERE 
    (filter_language IS NULL OR circulars.language = filter_language)
    AND circulars.embedding IS NOT NULL
    AND 1 - (circulars.embedding <=> query_embedding) > match_threshold
  ORDER BY circulars.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
