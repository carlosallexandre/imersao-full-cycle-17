package main

import (
	"database/sql"
	"fmt"
	"net/http"

	"github.com/carlosallexandre/imersao17/goapi/internal/database"
	"github.com/carlosallexandre/imersao17/goapi/internal/service"
	"github.com/carlosallexandre/imersao17/goapi/internal/webserver"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	_ "github.com/go-sql-driver/mysql"
)

func main() {
	db, err := sql.Open("mysql", "root:root@tcp(localhost:3306)/imersao17")
	if err != nil {
		panic(err.Error())
	}
	defer db.Close()

	categoryDB := database.NewCategoryDB(db)
	categoryService := service.NewCategoryService(*categoryDB)
	webCategoryHandler := webserver.NewWebCategoryHandler(categoryService)

	productDB := database.NewProductDB(db)
	productService := service.NewProductService(*productDB)
	webProductHandler := webserver.NewWebProductHandler(productService)

	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Route("/categories", func(r chi.Router) {
		r.Get("/{id}", webCategoryHandler.GetCategory)
		r.Get("/", webCategoryHandler.GetCategories)
		r.Post("/", webCategoryHandler.CreateCategory)
	})

	r.Route("/products", func(r chi.Router) {
		r.Get("/categories/{categoryID}", webProductHandler.GetProductByCategoryID)
		r.Get("/{id}", webProductHandler.GetProduct)
		r.Get("/", webProductHandler.GetProducts)
		r.Post("/", webProductHandler.CreateProduct)
	})

	fmt.Println("Server is running on port 8080")
	http.ListenAndServe(":8080", r)
}
