package main

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"trost.dev/apple-music-api/pkg/auth"
)

func getJwt(c *gin.Context) {
	jwt, err := auth.GetJwt()
	if err != nil {
		log.Fatal(err)
	}

	c.JSON(http.StatusOK, gin.H{
		"token":     jwt.Token,
		"expiresAt": jwt.ExpiresAt,
	})
}

func main() {
	fmt.Println("Starting Application...")
	auth.Initialize()
	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"*"},
		AllowHeaders:     []string{"Origin"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
	r.GET("token", getJwt)

	r.Run()
}
