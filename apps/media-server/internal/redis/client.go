package redis

import (
	"context"
	"log"

	"github.com/redis/go-redis/v9"
)

type Client struct {
	client *redis.Client
	ctx    context.Context
}

func NewClient(addr string) *Client {
	rdb := redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: "",
		DB:       0,
	})

	ctx := context.Background()

	// Test connection
	if err := rdb.Ping(ctx).Err(); err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}

	return &Client{
		client: rdb,
		ctx:    ctx,
	}
}

func (c *Client) Publish(channel string, message string) error {
	return c.client.Publish(c.ctx, channel, message).Err()
}

func (c *Client) Subscribe(channel string) *redis.PubSub {
	return c.client.Subscribe(c.ctx, channel)
}

func (c *Client) Set(key string, value string) error {
	return c.client.Set(c.ctx, key, value, 0).Err()
}

func (c *Client) Get(key string) (string, error) {
	return c.client.Get(c.ctx, key).Result()
}

func (c *Client) Del(key string) error {
	return c.client.Del(c.ctx, key).Err()
}

func (c *Client) Close() error {
	return c.client.Close()
}
