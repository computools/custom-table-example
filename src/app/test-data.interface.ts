export interface ITestData {
  id: number;
  firstName: string;
  lastName: string;
  data1: {
    innerData1: string;
    innerData2: string;
  };
  data2: {
    innerData3: string;
    innerData4: string;
  };
}
