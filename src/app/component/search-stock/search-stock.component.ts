import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Form, FormControl, FormGroup, Validators } from '@angular/forms';
import { Stock } from 'src/app/model/stock';
import { DataService } from 'src/app/services/data.service';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-search-stock',
  templateUrl: './search-stock.component.html',
  styleUrls: ['./search-stock.component.css']
})
export class SearchStockComponent implements OnInit {

  @Output() stock = new EventEmitter<Stock>();
  stockForm: FormGroup;
  showError: boolean = false;
  showSpinner: boolean = false;

  constructor(private data: DataService, private utility: UtilityService) { }

  ngOnInit(): void {
    this.stockForm = new FormGroup({
      symbol: new FormControl('', Validators.required)
    })
  }


  searchBySymbol() {
    this.showSpinner = true;
    let stockSymbol = this.stockForm.controls['symbol'].value.toUpperCase();

    //check if stock is already in local storage
    let isStored = this.utility.stockIsAlreadyStored(stockSymbol);
    
    if(!isStored){
      let search = this.data.search(stockSymbol);
      search.subscribe({
        next: (res) => {
  
          this.showSpinner = false;
  
            if (res['count'] != 0) {
  
            let stockRes = res['result'].find(obj => {
              return obj.symbol === stockSymbol;
            });
  
            if (stockRes) {
              localStorage.setItem("stock_" + Date.now(), JSON.stringify(stockRes));
              this.stock.emit(stockRes);
            }
  
          }
          this.stockForm.reset();
        },
        error: (err) => {
          this.showSpinner = false;
          this.showError = true;
          this.stockForm.reset();
        }
      });
    }
   
  }

}
