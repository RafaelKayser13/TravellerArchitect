import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'upp',
  standalone: true
})
export class UppPipe implements PipeTransform {
  transform(value: number): string {
    if (value < 0) return '0';
    if (value <= 9) return value.toString();
    
    // UPP logic: 10=A, 11=B, ..., skipping I and O
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const index = value - 10;
    
    if (index >= 0 && index < chars.length) {
      return chars[index];
    }
    
    return value.toString();
  }
}
