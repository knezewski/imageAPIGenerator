package main

import (
	"context"
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"strconv"
	"sync"
	"time"

	"image_API_generator/backend/drawing"

	"golang.org/x/exp/maps"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/golang-queue/queue"
	"github.com/golang-queue/queue/core"
)

type jobData struct {
	Id        string
	Generator string
}

var sm sync.Map

func (j *jobData) Bytes() []byte {
	b, _ := json.Marshal(j)
	return b
}

func router() *gin.Engine {
	router := gin.Default()

	// Add CORS middleware before defining routes
	config := cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}
	router.Use(cors.New(config))

	time.Now().Unix()

	q := queue.NewPool(30, queue.WithFn(func(c context.Context, m core.QueuedMessage) error {
		j, _ := m.(*jobData)
		json.Unmarshal(m.Bytes(), &j)

		sleepTime := time.Duration(rand.Intn(10)) * time.Second
		time.Sleep(sleepTime)
		path := drawing.DrawOne(j.Generator)
		sm.Store(j.Id, path)
		fmt.Printf("Stored: %s:%s [%s]/n", j.Id, j.Generator, path)

		return nil
	}))

	// Define routes after middleware

	imageRoute := router.Group("/image")
	{
		imageRoute.GET("/:generator", func(c *gin.Context) {
			generator := c.Param("generator")
			file := drawing.DrawOne(generator)
			c.Header("Content-Type", "image/png")
			c.File(file)
		})

		imageRoute.GET("/names", func(c *gin.Context) {
			drawingsList := make(map[string]interface{})
			for i, name := range maps.Keys(drawing.DRAWINGS) {
				drawingsList[strconv.Itoa(i)] = name
			}
			c.JSON(http.StatusOK, drawingsList)
		})

	}

	listRoute := router.Group("/list")
	{
		listRoute.GET("/simple", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"keys": maps.Keys(drawing.DRAWINGS),
			})
		})
	}

	newRoute := router.Group("/new")
	{
		newRoute.GET("/load/:id", func(c *gin.Context) {
			id := c.Param("id")
			path, ok := sm.Load(id)

			if ok {
				fmt.Printf("Found %s for id: %s/n", path, id)
				c.Header("Content-Type", "image/png")
				c.File(fmt.Sprintf("%s", path.(string)))
			} else {
				fmt.Printf("Path not found for id: %s\n", id)
				c.Header("Content-Type", "image/jpg")
				c.Header("Cache-Control", "no-cache")
			}
		})

		newRoute.GET("/:generator", func(c *gin.Context) {
			generator := c.Param("generator")
			newJob := jobData{
				Id:        strconv.Itoa(rand.Int()),
				Generator: generator,
			}
			q.Queue(&newJob)
			res := map[string]string{"id": newJob.Id, "url": "http://" + c.Request.Host + "/new/load/" + newJob.Id}
			c.JSON(200, res)
		})
	}

	return router
}

func main() {
	router().Run()
}
