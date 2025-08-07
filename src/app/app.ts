import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet], // Only import RouterOutlet
  // templateUrl: './app.html',
  template:` 
  <main> <router-outlet/></main>
  `,
  styles: [`
    main {
       padding-inline: 16px;
    }
    `],
})
export class App {
  protected readonly title = signal('hello-world');
}