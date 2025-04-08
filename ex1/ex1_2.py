import pandas as pd
import os
from collections import defaultdict

# part 1
def preprocess_data(df):
    df['timestamp'] = pd.to_datetime(df['timestamp'], errors='coerce') 
    df['value'] = pd.to_numeric(df['value'], errors='coerce') 
    df = df.drop_duplicates()# Drop duplicates
    df = df.dropna(subset=['timestamp', 'value'])# Drop rows with missing values in timestamp or value
    df = df[df['value'] >= 0]  # drop negative

    return df

def compute_hourly_averages(df):
    df['hour'] = df['timestamp'].dt.floor('h')
    hourly_avg = df.groupby('hour')['value'].mean().round(1).reset_index()
    hourly_avg.columns = ['timestamp', 'value']
    return hourly_avg

# part 2
def split_and_process_by_day(df, output_folder="daily_outputs"):
    df['date'] = df['timestamp'].dt.date
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    all_hourly = []

    for date, group in df.groupby('date'):
        daily_avg = compute_hourly_averages(group)
        all_hourly.append(daily_avg)
        output_file = os.path.join(output_folder, f"hourly_avg_{date}.csv")
        daily_avg.to_csv(output_file, index=False)

    # Merge all daily results into one final DataFrame
    final_df = pd.concat(all_hourly).sort_values('timestamp')
    final_df.to_csv("final_hourly_averages.csv", index=False)
    return final_df

# part 3
# To support real-time data streams, we maintain running sums and counts per hour.
# Each new data point updates the hourly average without storing the entire dataset.

data = defaultdict(lambda: [0, 0]) # Stores running sum and count per hour. Example: data[hour] = [total_sum, count]

def process(timestamp, value):
    hour = pd.to_datetime(timestamp).floor('h')
    data[hour][0] += value
    data[hour][1] += 1

def get_average(hour):
    if hour in data:
        total, count = data[hour]
        return round(total / count, 1)
    return None

# part 4
# Note: To read .parquet files, install 'pyarrow' or 'fastparquet' via pip.
# Parquet is efficient for large data: Low storage consumption.
# Efficient in reading Data in less time as it is columnar storage and minimizes latency. 
# Supports advanced nested data structures. Optimized for queries that process large volumes of data.
# Note: change in code "value" with "mean_value" ta match time_series.parquet file


def load_time_series_file(file_path):
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    if file_path.endswith('.csv'):
        return pd.read_csv(file_path)
    elif file_path.endswith('.parquet'):
        return pd.read_parquet(file_path)
    elif file_path.endswith('.xlsx'):
        return pd.read_excel(file_path)
    else:
        raise ValueError("Unsupported file format")

# main
if __name__ == "__main__":
    file_path = "time_series.xlsx" 
    try:
        df = load_time_series_file(file_path)
        df = preprocess_data(df)
        final_result = split_and_process_by_day(df)
        print(final_result)
    except FileNotFoundError as e:
        print(f"Error: {e}")