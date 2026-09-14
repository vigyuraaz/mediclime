import sqlite3

def check_db():
    conn = sqlite3.connect("mediclime.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id, status, model FROM generation_jobs")
    jobs = cursor.fetchall()
    for job in jobs:
        print(job)
    
    # Update them if they have 1.5-pro
    cursor.execute("UPDATE generation_jobs SET model = 'gemini-3.6-flash' WHERE model LIKE '%1.5-pro%'")
    conn.commit()
    print("Updated rows:", cursor.rowcount)
    conn.close()

if __name__ == "__main__":
    check_db()
