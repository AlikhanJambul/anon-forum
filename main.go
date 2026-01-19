package main

import (
	"fmt"
	"time"
)

type sexExperience string
type theTruth bool

const (
	positiveSexExperience sexExperience = "I have expirience"
	TheTruth              theTruth      = true
	negativeSexExperience sexExperience = "I have no expirience"
)

type Ansar struct {
	Name        string
	Age         uint8
	CreatedAt   time.Time
	UpdatedAt   time.Time
	Duration    time.Duration
	Expired     bool
	LinkedList  Node
	Alive       bool
	HP          bool
	Windows     bool
	Mac         bool
	IPhone      bool
	Sex         sexExperience
	Children    bool
	Wife        bool
	WiFi        bool
	Parents     bool
	Placement   Placement
	AnsarMogger theTruth
}

type Placement struct {
	long string
	lati string
}

type Node struct {
	Node  *Node
	Value int
}

func main() {
	list := Node{}
	place := Placement{lati: "123", long: "123"}

	Ansar := Ansar{
		Name:        "Ansar",
		Age:         18,
		CreatedAt:   time.Date(2007, 11, 10, 12, 00, 00, 00, nil),
		UpdatedAt:   time.Now(),
		Duration:    time.Hour,
		Expired:     false,
		LinkedList:  list,
		Alive:       true,
		HP:          false,
		Windows:     true,
		Mac:         false,
		IPhone:      true,
		Sex:         positiveSexExperience,
		Children:    false,
		Wife:        false,
		WiFi:        true,
		Parents:     true,
		Placement:   place,
		AnsarMogger: TheTruth,
	}
	fmt.Println(Ansar)
}
