package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	http.Handle("/", http.FileServer(http.Dir(".")))

	fmt.Println("listening on: http://localhost:2001")
	err := http.ListenAndServe(":2001", nil)
	if err != nil {
		log.Fatal(err)
	}
}
