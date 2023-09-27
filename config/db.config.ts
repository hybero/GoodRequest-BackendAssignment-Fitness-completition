export const dbConfig = {
    HOST: "localhost",
    USER: "pavolh",
    PASSWORD: "pavol123",
    DB: "fitness_app",
    dialect: "postgres",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};