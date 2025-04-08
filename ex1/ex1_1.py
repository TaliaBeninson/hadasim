import pandas as pd
from collections import Counter 

def extract_error_code(row):
    return str(row).split("Error: ")[1].strip() 

def get_top_n_errors_from_excel(file_path, n, chunk_size=10000):
    error_counter = Counter()
    start = 0
    total_rows = pd.read_excel(file_path, usecols="A").shape[0]  # Time: O(T)

    while start < total_rows:
        df_chunk = pd.read_excel(file_path, usecols="A", skiprows=start, nrows=chunk_size, header=None)  # Time: O(K)
        df_chunk['ErrorCode'] = df_chunk[0].apply(extract_error_code) 
        chunk_counts = Counter(df_chunk['ErrorCode'].dropna())  # Time: O(K)
        error_counter.update(chunk_counts)  # Time: O(U)
        start += chunk_size

    return error_counter.most_common(n)  # Time: O(U log N) - Uses a heap to find top-N from U unique codes efficiently


# Main runner
if __name__ == "__main__":
    file_path = "logs.xlsx"  # Original file renamed from logs.txt.xlsx for clarity
    N = 5  # e.g show top 5
    results = get_top_n_errors_from_excel(file_path, N)
    for error_code, count in results:
        print(f"{error_code}: {count}")



# ---------------------------------------------------------
# Time Complexity:
#   O(T + U log N)
#   - T = total number of rows in the file
#   - U = number of unique error codes
#   - N = number of top frequent codes to return

# Space Complexity:
#   O(K + U)
#   - K = chunk_size rows loaded in memory at once
#   - U = number of unique error codes tracked in memory

