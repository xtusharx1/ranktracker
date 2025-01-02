import React from "react";
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Page,
  Inject,
} from "@syncfusion/ej2-react-grids";
import { Header } from "../components";
import { FaPen } from "react-icons/fa"; // Edit icon

const coursesData = [
  { id: 1, courseName: "SSQ 6th Dabad Academy Delhi", price: 40000 },
  { id: 2, courseName: "SSQ 9th Dabad Academy Gurgaon", price: 170000 },
  { id: 3, courseName: "SSQ 6th Dabad Academy Gurgaon", price: 170000 },
  { id: 4, courseName: "SSQ 6th Dabad Academy Online", price: 40000 },
];

const CourseTable = () => {
  // Add custom buttons for actions and view with improved styling
  const actionTemplate = () => (
    <FaPen className="text-blue-500 cursor-pointer hover:text-blue-700 transition duration-300" />
  );
  const viewTemplate = () => (
    <button className="bg-amber-700 text-white px-4 py-2 rounded-md hover:bg-amber-800 transition duration-300">
      View Course Test
    </button>
  );
 return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl shadow-lg">
      <Header category="Batches" title="Course" />
      <GridComponent
        dataSource={coursesData}
        allowPaging={true}
        pageSettings={{ pageSize: 4 }}
        width="100%"
      >
        <ColumnsDirective>
          <ColumnDirective field="id" headerText="S.NO" textAlign="Center" width="70" />
          <ColumnDirective
            field="courseName"
            headerText="COURSE NAME"
            textAlign="Left"
            width="250"
          />
          <ColumnDirective
            field="price"
            headerText="COURSE PRICE"
            textAlign="Center"
            width="150"
          />
          <ColumnDirective
            headerText="ACTION"
            template={actionTemplate}
            textAlign="Center"
            width="100"
          />
          <ColumnDirective
            headerText="VIEW"
            template={viewTemplate}
            textAlign="Center"
            width="150"
          />
        </ColumnsDirective>
        <Inject services={[Page]} />
      </GridComponent>
    </div>
  );
};

export default CourseTable;
