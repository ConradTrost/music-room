package auth

import (
	"crypto/ecdsa"
	"log"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"

	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/ssm"
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

func InitializeForLambda() {
	sess := session.Must(session.NewSession())
	ssmSvc := ssm.New(sess)

	kidParamName := "/app/music-room-api/kid"
	issuerParamName := "/app/music-room-api/issuer"
	secretKeyParamName := "/app/music-room-api/secret-key"

	withDecryption := true

	kidParam, err := ssmSvc.GetParameter(&ssm.GetParameterInput{
		Name:           &kidParamName,
		WithDecryption: &withDecryption,
	})
	if err != nil {
		log.Fatalf("Failed to get parameter: %v", err)
	}
	issuerParam, err := ssmSvc.GetParameter(&ssm.GetParameterInput{
		Name:           &issuerParamName,
		WithDecryption: &withDecryption,
	})
	if err != nil {
		log.Fatalf("Failed to get parameter: %v", err)
	}
	secretKeyParam, err := ssmSvc.GetParameter(&ssm.GetParameterInput{
		Name:           &secretKeyParamName,
		WithDecryption: &withDecryption,
	})
	if err != nil {
		log.Fatalf("Failed to get parameter: %v", err)
	}

	kid = *kidParam.Parameter.Value
	issuer = *issuerParam.Parameter.Value

	secretKeyBytes := []byte(*secretKeyParam.Parameter.Value)
	secretKey, err = jwt.ParseECPrivateKeyFromPEM(secretKeyBytes)
	if err != nil {
		log.Fatal(err)
	}
}
