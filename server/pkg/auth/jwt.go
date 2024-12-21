package auth

import (
	"crypto/ecdsa"
	"log"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
)

type JwtResponse struct {
	Token     string
	ExpiresAt int64
}

var (
	secretKey *ecdsa.PrivateKey
	issuer    string
	kid       string
)

func GetJwt() (JwtResponse, error) {
	expirationTime := time.Now().Add(time.Hour).Unix()
	token := jwt.NewWithClaims(jwt.SigningMethodES256,
		jwt.MapClaims{
			"iss": issuer,
			"iat": time.Now().Unix(),
			"exp": expirationTime,
		})

	token.Header["kid"] = kid
	tokenString, err := token.SignedString(secretKey)
	if err != nil {
		return JwtResponse{}, err
	}

	return JwtResponse{
		Token:     tokenString,
		ExpiresAt: expirationTime,
	}, nil
}

func Initialize() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatalf("Error loading .env file")
	}

	filePath := os.Getenv("SECRET_KEY_FILE_PATH")
	issuer = os.Getenv("ISSUER")
	kid = os.Getenv("KID")

	if filePath == "" {
		log.Fatal("SECRET_KEY_FILE_PATH is not set")
	}
	if issuer == "" {
		log.Fatal("ISSUER is not set")
	}
	if kid == "" {
		log.Fatal("KID is not set")
	}

	data, err := os.ReadFile(filePath)
	if err != nil {
		panic(err)
	}

	secretKey, err = jwt.ParseECPrivateKeyFromPEM(data)
	if err != nil {
		log.Fatal(err)
	}
}
