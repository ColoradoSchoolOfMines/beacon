# Statistical analysis of the utilities.safe_random() RNG
#
# SQL:
#
# -- Create the table
# CREATE TABLE public.safe_random_values (
#   id BIGSERIAL PRIMARY KEY,
#   value DOUBLE PRECISION NOT NULL
# );

# -- Insert 1 million random values
# DO
# $$
# BEGIN
#   FOR i IN 1..1000000 LOOP
#     INSERT INTO public.safe_random_values (
#       value
#     ) VALUES (
#       (utilities.safe_random())
#     );
#   END LOOP;
# END
# $$;

# Imports
import pandas as pd
from scipy import stats
from itertools import pairwise

def find_closest(lst: list):
  """
  Find the closest pair of values in a list
  See https://codereview.stackexchange.com/a/278527
  """
  return min(pairwise(lst), key=lambda a: abs(a[1] - a[0]))

# Load the data
df = pd.read_csv("data.csv")

# Get values
values = df['value'].to_numpy()

# Analyze the uniformity of the values
uniformity = stats.kstest(values, stats.norm.cdf)
print(f"[Kolmogorov-Smirnov] p = {uniformity.pvalue:.54f}")

# Analyze the closest pair of values
closest = find_closest(values)
print(f"[Closest pair] {closest[0]:.54f} and {closest[1]:.54f} (difference = {abs(closest[0] - closest[1]):.54f})")
