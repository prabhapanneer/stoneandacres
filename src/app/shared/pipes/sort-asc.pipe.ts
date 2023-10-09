import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortAsc'
})

export class SortAscPipe implements PipeTransform {

  transform(array: any, args: string): any {
    if (array !== undefined) {
      array = JSON.parse(JSON.stringify(array));
      array.sort((a: any, b: any) => 0 - (a[args] > b[args] ? -1 : 1));
    }
    return array;
  }

}