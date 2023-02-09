import psycopg2
import datetime

conn = psycopg2.connect(
    host="localhost",
    database="objectscanner_2000",
    user="objectscanner_2000",
    password="objectscanner_2000")

def psql_create_object():
    name = "Object@" + str(datetime.datetime.now())

    cur = conn.cursor()
    cur.execute("INSERT INTO objects (name) VALUES ('Objektname') RETURNING id;", ())

    object_id = cur.fetchone()[0]

    conn.commit()
    cur.close()

    return object_id

def psql_add_object_measurement(object_id: int, height_index: int, rotary_table_index: int, normalized_measured_distance: float):
    if height_index < 0:
        raise ValueError("height_index must be greater than 0")
    if rotary_table_index < 0:
        raise ValueError("rotary_table_index must be greater than 0")
    if normalized_measured_distance < 0 or normalized_measured_distance > 1:
        raise ValueError("normalized_measured_distance must be between 0 and 1")

    cur = conn.cursor()
    cur.execute("INSERT INTO object_measurements(object_id, height_index, rotary_table_index, normalized_measured_distance) VALUES(%s, %s, %s, %s);", (object_id, height_index, rotary_table_index, normalized_measured_distance))
    conn.commit()
    cur.close()
