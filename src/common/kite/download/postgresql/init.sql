CREATE TABLE employees (
   employee_id   NUMERIC       NOT NULL,
   first_name    VARCHAR(1000) NOT NULL,
   last_name     VARCHAR(1000) NOT NULL,
   date_of_birth DATE                  ,
   phone_number  VARCHAR(1000) NOT NULL,
   junk          CHAR(1000)            ,
   CONSTRAINT employees_pk PRIMARY KEY (employee_id)
);
CREATE FUNCTION random_string(minlen NUMERIC, maxlen NUMERIC)
RETURNS VARCHAR(1000)
AS
$$
DECLARE
  rv VARCHAR(1000) := '';
  i  INTEGER := 0;
  len INTEGER := 0;
BEGIN
  IF maxlen < 1 OR minlen < 1 OR maxlen < minlen THEN
    RETURN rv;
  END IF;

  len := floor(random()*(maxlen-minlen)) + minlen;

  FOR i IN 1..floor(len) LOOP
    rv := rv || chr(97+CAST(random() * 25 AS INTEGER));
  END LOOP;
  RETURN rv;
END;
$$ LANGUAGE plpgsql;
INSERT INTO employees (employee_id,  first_name,
                       last_name,    date_of_birth, 
                       phone_number, junk)
SELECT GENERATE_SERIES
     , initcap(lower(random_string(2, 8)))
     , initcap(lower(random_string(2, 8)))
     , CURRENT_DATE - CAST(floor(random() * 365 * 10 + 40 * 365) AS NUMERIC) * INTERVAL '1 DAY'
     , CAST(floor(random() * 9000 + 1000) AS NUMERIC)
     , 'junk'
  FROM GENERATE_SERIES(1, 1000);
UPDATE employees 
   SET first_name='MARKUS', 
       last_name='WINAND'
 WHERE employee_id=123;
VACUUM ANALYZE employees;