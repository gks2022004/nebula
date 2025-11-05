package config

import "os"

type Config struct {
	Port      string
	RedisHost string
	AWSRegion string
	S3Bucket  string
}

func New() *Config {
	return &Config{
		Port:      getEnv("PORT", "8080"),
		RedisHost: getEnv("REDIS_HOST", "localhost:6379"),
		AWSRegion: getEnv("AWS_REGION", "us-east-1"),
		S3Bucket:  getEnv("S3_BUCKET", "nebula-recordings"),
	}
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
