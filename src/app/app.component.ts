import {CdkDragDrop,moveItemInArray,transferArrayItem,} 
from "@angular/cdk/drag-drop";
import { FormsModule } from "@angular/forms";
import { Component, ElementRef,OnInit, QueryList,ViewChildren,} from "@angular/core";

interface KanbanCard {
  number: string;
  description: string;
  assignedTo: string | null;
  state: string;
  isEditing?: boolean;
}
interface User {
  id: string;
  name: string;
}

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  backlogCards: KanbanCard[] = [];
  newCardDescription: string = "";
  todoCards: KanbanCard[] = [];
  inProgressCards: KanbanCard[] = [];
  readyCards: KanbanCard[] = [];
  doneCards: KanbanCard[] = [];
  showNewCard: boolean = false;
  progressCount: number = 0; // For 'To do'
  progressCountInProgress: number = 0; // For 'In Progress'
  progressCountReadyForTesting: number = 0; // For 'Ready For Testing'
  progressCountDone: number = 0; // For 'Done'
  cardLocalStorageKey = "kanbanCards";
  users: User[] = [
    { id: "1", name: "User 1" },
    { id: "2", name: "User 2" },
    { id: "3", name: "User 3" },
  ];
  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    this.loadCardsFromLocalStorage();
  }

  onOutsideClick(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;
    const cardElement = document.querySelector(".card") as HTMLElement;

    if (!cardElement.contains(targetElement)) {
      this.showNewCard = false;
    }
  }
  loadCardsFromLocalStorage() {
    const storedCards = localStorage.getItem(this.cardLocalStorageKey);
    if (storedCards) {
      const allCards = JSON.parse(storedCards);
      this.backlogCards = allCards.backlogCards || [];
      this.todoCards = allCards.todoCards || [];
      this.inProgressCards = allCards.inProgressCards || [];
      this.readyCards = allCards.readyCards || [];
      this.doneCards = allCards.doneCards || [];
    }
  }

  getCardNumber(cardNumberWithPrefix: string): string {
    // Assuming the cardNumberWithPrefix is in the format "Card 1234"
    // Split the string by space and get the last element (which is the number)
    const numberArr = cardNumberWithPrefix.split(" ");
    return numberArr[numberArr.length - 1];
  }

  saveCardsToLocalStorage() {
    const allCards = {
      backlogCards: this.backlogCards,
      todoCards: this.todoCards,
      inProgressCards: this.inProgressCards,
      readyCards: this.readyCards,
      doneCards: this.doneCards,
    };
    localStorage.setItem(this.cardLocalStorageKey, JSON.stringify(allCards));
  }

  addCard() {
    if (this.newCardDescription.trim() !== "") {
      const newCard: KanbanCard = {
        number: this.generateRandomNumber(),
        description: this.newCardDescription,
        assignedTo: null,
        state: "New",
      };
      this.backlogCards.push(newCard);
      this.newCardDescription = "";
      this.showNewCard = false;
      console.log("Card", this.showNewCard);
      this.progressCount = this.todoCards.length;
      this.saveCardsToLocalStorage();
    }
  }

  addTask(card: KanbanCard) {
    // Implement logic to add a task to the card
    console.log("Adding task to card:", card);
  }

  addBug(card: KanbanCard) {
    // Implement logic to add a bug to the card
    console.log("Adding bug to card:", card);
  }

  assignTask(card: KanbanCard, event: Event) {
    const target = event.target as HTMLSelectElement;
    const userId = target.value;
    card.assignedTo = userId;
  }

  drop(event: CdkDragDrop<KanbanCard[]>, section: string) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      const droppedCard: KanbanCard =
        event.previousContainer.data[event.previousIndex];
      switch (section) {
        case "backlog":
          droppedCard.state = "New";
          break;
        case "todo":
          droppedCard.state = "Active";
          break;
        case "inprogress":
          droppedCard.state = "Active";
          this.progressCount = 0; // Reset progress count when card is moved to 'In Progress'
          break;
        case "readyfortesting":
          droppedCard.state = "Resolved";
          this.progressCount = 0; // Reset progress count when card is moved to 'Ready For Testing'
          break;
        case "done":
          droppedCard.state = "Closed";
          this.progressCount = 0; // Reset progress count when card is moved to 'Done'
          break;
        default:
          break;
      }
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Calculate the progress count for each section
      this.progressCount = this.todoCards.length;
      this.progressCountInProgress = this.inProgressCards.length;
      this.progressCountReadyForTesting = this.readyCards.length;
      this.progressCountDone = this.doneCards.length;
      this.saveCardsToLocalStorage();
    }
  }

  generateRandomNumber(): string {
    const randomNumber = Math.floor(Math.random() * 10000);
    return randomNumber.toString(); // Return the random number as a string
  }

  deleteCard(card: KanbanCard) {
    const index = this.backlogCards.indexOf(card);
    if (index > -1) {
      this.backlogCards.splice(index, 1);
      this.saveCardsToLocalStorage();
    }
  }
  toggleEditing(card: KanbanCard) {
    card.isEditing = !card.isEditing;
  }
}
