package service

import (
	"github.com/carlosallexandre/imersao17/goapi/internal/database"
	"github.com/carlosallexandre/imersao17/goapi/internal/entity"
)

type ProductService struct {
	ProductDB database.ProductDB
}

func NewProductService(productDB database.ProductDB) *ProductService {
	return &ProductService{ProductDB: productDB}
}

func (ps *ProductService) GetProducts() ([]*entity.Product, error) {
	return ps.ProductDB.GetProducts()
}

func (ps *ProductService) GetProduct(id string) (*entity.Product, error) {
	return ps.ProductDB.GetProduct(id)
}

func (ps *ProductService) GetProductByCategoryID(categoryID string) ([]*entity.Product, error) {
	return ps.ProductDB.GetProductByCategoryID(categoryID)
}

func (ps *ProductService) CreateProduct(name, description, categoryID, imageURL string, price float64) (*entity.Product, error) {
	return ps.ProductDB.CreateProduct(
		entity.NewProduct(
			name,
			description,
			categoryID,
			imageURL,
			price,
		),
	)
}
