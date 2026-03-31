DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'FormType'
      AND e.enumlabel = 'CAT'
  ) THEN
    ALTER TYPE "FormType" ADD VALUE 'CAT';
  END IF;
END $$;
