import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-report',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './main-report.component.html',
  styleUrl: './main-report.component.scss',
})
export class MainReportComponent {
  constructor(private router: Router) {}
}
