import { Component, OnInit } from '@angular/core';
import { filter, forkJoin, from, interval, map, mergeMap, Observable, of, share, switchMap, take, takeLast, takeWhile, tap } from 'rxjs';
import {HttpClient} from '@angular/common/http';
import { Person } from './person';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent implements OnInit {

  constructor(private http: HttpClient){

  }
  title = 'rxjs-operators';

   peoples: Person[] = [
    { name: "Alice", age: 25, isStudent: false },
    { name: "Bob", age: 22, isStudent: true },
    { name: "Charlie", age: 30, isStudent: false },
  ];

  ngOnInit(): void {
    const names =this.peoples.map((people : Person)=>({
      ...people,
      lastName: people.name
    }));
    console.log("names :",names)
    this.of_from_operators(this.peoples)
    this.tap_map_operators(this.peoples)
    const request = this.http.get('https://dummyjson.com/todos').pipe(share()) //multicast observable
    this.share_operator(request)
    request.subscribe()
    this.take_operator(this.peoples)
    this.switchMap_Operator(this.peoples)
    this.mergeMap_Operator(this.peoples)
    this.forkJoin_operator()
  }

  /**
   * of_from_operators
   * both transform objects into observables
   * from do the spreading/flattening of objects
   */
  public of_from_operators(peoples: Person[]) {
    of(peoples).subscribe(console.log)
    from(peoples).subscribe(console.log) //flatten objects

    of([1,2,3]).subscribe((data)=>console.log("of :",data))
    from([1,2,3]).subscribe((data)=>console.log("from :",data))

    
  }

  /**
   * tap used for side effects and debbuging
   * map used to transform data
   */
  public tap_map_operators(peoples: Person[]) {
     

    from(peoples).pipe(
      tap(people=>{
        console.log("people :",people)
        people.name = people.name+" student";
      }),
      map(people=>people.name),

    ).subscribe(data=>console.log("data after tap and map operators :",data))


    //return only student persons
    of(peoples).pipe(
      map((persons)=>persons.filter(person=>person.isStudent)),
      tap((value)=>console.log("person student alue : value"),
        ((error)=>console.error(error.message))
    )
    ).subscribe(console.log)

    //return non student person

    from(peoples).pipe(
      filter((people)=>!people.isStudent)
    ,
    tap((value)=>console.log("people not student :",value)))
    .subscribe(console.log)
    
    
  }
  /**
   * make only one instance of that observable
   */
    public share_operator(request : any){
      request.subscribe()

    }
  /**
   * rxjs take operator
   */
    public take_operator(peoples: Person[]){

      //take first 1 stream of people not student
      from(peoples).pipe(
        filter(people=>!people.isStudent),
        take(1)
      ).subscribe(data=>console.log("first non student person :",data))

        //take last 1 stream of people not student
        from(peoples).pipe(
          filter(people=>!people.isStudent),
          takeLast(1)
        ).subscribe(data=>console.log("last non student person :",data))

        //takewhile condition is still valid

        let counter =0 //count of persons not student
        from(peoples).pipe(
          filter(people=>!people.isStudent),
          tap(()=>{
            counter++
          }),
          takeWhile(()=>counter <=1)
        ).subscribe(data=>console.log("only first student person :",data))
      

    }

    /**
   * rxjs switchMap operator
   * assure only latest observable is running and do unsbscribe for first one after it emits first value
   */

    public switchMap_Operator(peoples: Person[]){
      from(peoples).pipe(
        //new observable
        tap(people=>console.log("switchMap people : ",people)),
        switchMap((people)=>{
          return this.peopleObservable(people);
        })

      ).subscribe(x=>console.log('switchMap :',x))

    }

    public peopleObservable (people: Person) : Observable<string | undefined>{
      return of(people).pipe(map(people=>people.name));
    }

     /**
   * rxjs mergehMap operator
   * take value from first observable and pass it to second observable to do some operations with it
   */

         public mergeMap_Operator(peoples: Person[]){
          let numbers = of(10,2,3);
          numbers.pipe(
            mergeMap((number: number)=>{
               return from(peoples).pipe(
                map((people : Person)=>({
                    ...people,
                    age: number + people.age 
                  
                }))
               );
            })
    
          ).subscribe(x=>console.log('mergeMap :',x))
    
        }

    /**
   * rxjs forkJoin operator
   * subscribe at latest outputs of observale and emit it inside array
   */
        public forkJoin_operator(){
          const numbers = of([1,2,3])
          const letters = of(['a','b','c'])
          forkJoin(numbers,letters).subscribe(
            value=>console.log(value),
            err=>console.log(err),
            ()=>console.log('completed')
          )
        }


}


