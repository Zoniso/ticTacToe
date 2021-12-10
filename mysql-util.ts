import * as mysql from 'mysql';

export class MysqlUtil {
    private connection: mysql.Connection;

    constructor() {
        this.connection = null;
    }

    async initConnection(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.connection = mysql.createConnection({
                    host: 'localhost',
                    user: 'root',
                    password: 'test'
                });
                this.connection.connect((err) => {
                    if (err) {
                        console.log(`failed connecting to mysql, error: ${err}`);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            } catch (e) {
                console.log(`failed creating mysql connection. error: ${e}`);
                reject(e);
            }
        });
    }

    async executeQuery(query) {
        return new Promise((resolve, reject) => {
            this.connection.query(query, (err, rows) => {
                if (err) {
                    console.log(`failed running query: ${query}`);
                    this.connection.end();
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async releaseConnection() {
        this.connection.end();
    }
}
