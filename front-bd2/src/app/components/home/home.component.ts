import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ReportService } from 'src/app/services/report.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  tables: string[] = ['Deputados', 'Despesas', 'Evento', 'Legislatura', 'Orgaos'];
  relatedTables: string[] = ['Despesas', 'Evento', 'Legislatura', 'Orgaos'];
  selectedTables: string[] = [];
  selectedMainTable!: string;
  reportData: any;
  isSubmitting: boolean = false;
  requestError: boolean = false;
  errorMessage: string = "";

  operators = {
    comparison: ["=", "!=", ">", "<", ">=", "<=", "like", "ilike"],
    logical: ["AND", "OR"],
    groupBy: ["COUNT", "SUM"],
    orderBy: ["ASC", "DESC"]
  }

  deputadoFields: any;
  eventoFields: any;
  despesasFields: any;
  orgaoFields: any;
  legislaturaFields: any;
  modeFields: any;

  form: FormGroup;

  displayedColumns: string[] = ["Aguardando consulta para carregar a tabela..."];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('TABLE') table!: ElementRef
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;

  constructor(
    private reportService: ReportService,
    private formBuilder: FormBuilder
  ) {
    this.form = this.formBuilder.group({
      selectedMainTable: [''],
      selectedRelatedTables: [[]],

      deputadoTableFields: [[]],
      despesasTableFields: [[]],
      legislaturaTableFields: [[]],
      orgaoTableFields: [[]],
      deputadoModeTableFields: [[]],
      eventoTableFields: [[]],

      deputadoTableFilters: [[]],
      despesasTableFilters: [[]],
      legislaturaTableFilters: [[]],
      orgaoTableFilters: [[]],
      deputadoModeTableFilters: [[]],
      eventoTableFilters: [[]],

      deputadoOperator1: [null],
      deputadoOperator2: [null],
      deputadoOperator3: [null],
      deputadoValue1: [null],
      deputadoValue2: [null],
      deputadoValue3: [null],

      despesasOperator1: [null],
      despesasOperator2: [null],
      despesasOperator3: [null],
      despesasValue1: [null],
      despesasValue2: [null],
      despesasValue3: [null],

      eventoOperator1: [null],
      eventoOperator2: [null],
      eventoOperator3: [null],
      eventoValue1: [null],
      eventoValue2: [null],
      eventoValue3: [null],

      legislaturaOperator1: [null],
      legislaturaOperator2: [null],
      legislaturaOperator3: [null],
      legislaturaValue1: [null],
      legislaturaValue2: [null],
      legislaturaValue3: [null],

      orgaoOperator1: [null],
      orgaoOperator2: [null],
      orgaoOperator3: [null],
      orgaoValue1: [null],
      orgaoValue2: [null],
      orgaoValue3: [null],

      deputadoModeOperator1: [null],
      deputadoModeOperator2: [null],
      deputadoModeOperator3: [null],
      deputadoModeValue1: [null],
      deputadoModeValue2: [null],
      deputadoModeValue3: [null],

      selectedAggsTable: [null],
      aggsParam: [null],
      logicalOperator: [null],
      limit: [null],
      orderBy: [null],
      func_agregada: [null],
      isChecked: [null]
    });
  }

  ngOnInit(): void {
    this.dataSource.data = [];
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  } 

  exportAsExcel() {
    const allData = this.dataSource.data;
    const tableData: any[] = [];
  
    // Iterar pelos registros e adicionar os dados à matriz
    allData.forEach((row: any) => {
      const rowData: any[] = [];
  
      // Iterar pelas colunas e obter os valores correspondentes
      this.displayedColumns.forEach((column: string) => {
        rowData.push(row[column]);
      });
  
      // Adicionar a linha de dados à matriz
      tableData.push(rowData);
    });
  
    // Criar uma planilha do Excel a partir dos dados da tabela
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(tableData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  
    // Salvar o arquivo do Excel
    XLSX.writeFile(wb, 'report.xlsx');
  }

  clearForm() {
    this.selectedTables = [];
    this.selectedMainTable = "";
    this.form.reset();
  }

  clearTable(dataSource: MatTableDataSource<any>, paginator: MatPaginator): void {
    // Limpa o dataSource definindo um novo array vazio
    dataSource.data = [];
    this.displayedColumns = ["Aguardando consulta para carregar a tabela..."];
  
    // Reseta o paginator
    if (paginator) {
      paginator.firstPage();
    }

    setTimeout(() => {
      this.requestError = false;
    }, 5000);
  }

  updateTableColumnsAndData(data: any) {
    this.dataSource.data = [];
    this.displayedColumns = ["Aguardando consulta para carregar a tabela..."];
    // this.paginator.length = data.length;

    if (data.length > 0) {
      this.dataSource.data = data;
      this.displayedColumns = Object.keys(data[0]);
      this.paginator.length = data.length;
    } else {
      this.displayedColumns = [];
    }
  }

  getTableStructure(tableName: string) {
    switch (tableName) {
      case "Deputados":
        this.deputadoFields = ['id', 'nome', 'siglapartido', 'siglauf', 'idlegislatura'];
        break;

      case "Evento":
        this.eventoFields = ['id', 'datahorainicio', 'situacao', 'descricao', 'datahorafim', 'localexterno', 'localcamara'];
        break;

      case "Despesas":
        this.despesasFields = ['id','numdocumento', 'coddocumento', 'tipodespesa', 'datadocumento', 'valordocumento', 'nomefornecedor', 'cnpjcpffornecedor', 'valorliquido', 'id_deputado'];
        break;

      case "Orgaos":
        this.orgaoFields = ['id', 'sigla', 'nome', 'apelido', 'codtipoorgao', 'tipoorgao', 'nomepublicacao'];
        break;

      case "Legislatura":
        this.legislaturaFields = ['id', 'datainicio', 'datafim'];
        break;
    }
  }

  onMainTableSelectionChange(): void {
    const selectedMainTable = this.form.controls['selectedMainTable'].value;

    this.selectedMainTable = selectedMainTable;
    this.form.controls['selectedRelatedTables'].setValue([]);
    this.selectedTables = [selectedMainTable];

    this.getTableStructure(selectedMainTable);
  }

  onRelatedTablesSelectionChange(): void {
    const selectedRelatedTables = this.form.controls['selectedRelatedTables'].value;

    // Remover as tabelas que não estão mais selecionadas
    this.selectedTables = this.selectedTables.filter(table => table === 'Deputados' || selectedRelatedTables.includes(table));

    // Adicionar as novas tabelas selecionadas
    selectedRelatedTables.forEach((element: string) => {
      if (element !== 'Deputados' && !this.selectedTables.includes(element)) {
        this.selectedTables.push(element);
      }
    });

    this.selectedTables.forEach(table => {
      this.getTableStructure(table);
    });
  }

  submitForm(form: any) {
    this.isSubmitting = true;

    let data: any = {};
    let request: any = {
      select: {},
      join: [],
      where: {},
      operators: {},
      values: {},
      condition: form.controls.logicalOperator.value,
      limit: form.controls.limit.value,
      order_by: null,
      func_agregada: null,
      group_by: form.get('isChecked')?.value
    };

    (Object.keys(form.controls) as (keyof typeof form.controls)[]).forEach((key, index) => {
      if (key !== "selectedRelatedTables") {
        if (Array.isArray(form.controls[key].value) && form.controls[key].value.length > 0) {
          data[key] = form.controls[key].value;
        }
      }
    });

    data.selectedTables = this.selectedTables;
    
    this.selectedTables.forEach(table => {
      if (table === "Deputados") {
        request.select.deputados = data.deputadoTableFields;
        request.join.push("deputados");
        request.where.deputados = data.deputadoTableFilters;
        request.operators.deputados = [form.controls.deputadoOperator1.value, form.controls.deputadoOperator2.value, form.controls.deputadoOperator3.value];
        request.values.deputados = [form.controls.deputadoValue1.value, form.controls.deputadoValue2.value, form.controls.deputadoValue3.value];
      } else if (table === "Despesas") {
        request.select.despesas = data.despesasTableFields;
        request.join.push("despesas");
        request.where.despesas = data.despesasTableFilters;
        request.operators.despesas = [form.controls.despesasOperator1.value, form.controls.despesasOperator2.value, form.controls.despesasOperator3.value];
        request.values.despesas = [form.controls.despesasValue1.value, form.controls.despesasValue2.value, form.controls.despesasValue3.value];
      } else if (table === "Evento") {
        if (this.selectedTables.includes("Deputados")) {
          request.select.deputados = data.deputadoModeTableFields;
          request.join.push("evento_deputado");
          request.join.push("evento");
          request.where.deputados = data.deputadoModeTableFilters;
          request.operators.deputados = [form.controls.deputadoModeOperator1.value, form.controls.deputadoModeOperator2.value, form.controls.deputadoModeOperator3.value];
          request.values.deputados = [form.controls.deputadoModeValue1.value, form.controls.deputadoModeValue2.value, form.controls.deputadoModeValue3.value];
        } else if (this.selectedTables.includes("Orgaos")){
          request.select.deputados = data.deputadoModeTableFields;
          request.join.push("evento_orgao");
          request.join.push("evento");
          request.where.deputados = data.deputadoModeTableFilters;
          request.operators.deputados = [form.controls.deputadoModeOperator1.value, form.controls.deputadoModeOperator2.value, form.controls.deputadoModeOperator3.value];
          request.values.deputados = [form.controls.deputadoModeValue1.value, form.controls.deputadoModeValue2.value, form.controls.deputadoModeValue3.value];
        }else {
          request.select.plataforms = data.eventoTableFields;
          request.join.push("evento");
          request.where.plataforms = data.eventoTableFilters;
          request.operators.plataforms = [form.controls.eventoOperator1.value, form.controls.eventoOperator2.value, form.controls.eventoOperator3.value];
          request.values.plataforms = [form.controls.eventoValue1.value, form.controls.eventoValue2.value, form.controls.eventoValue3.value];
        }
      } else if (table === "Legislatura") {
        request.select.legislatura = data.legislaturaTableFields;
        request.join.push("legislatura");
        request.where.legislatura = data.legislaturaTableFilters;
        request.operators.legislatura = [form.controls.legislaturaOperator1.value, form.controls.legislaturaOperator2.value, form.controls.legislaturaOperator3.value];
        request.values.legislatura = [form.controls.legislaturaValue1.value, form.controls.legislaturaValue2.value, form.controls.legislaturaValue3.value];
      } else if (table === "Orgaos") {
        request.select.orgaos = data.orgaoTableFields;
        request.join.push("deputado_orgao");
        request.join.push("orgaos");  
        request.where.orgaos = data.orgaoTableFilters;
        request.operators.orgaos = [form.controls.orgaoOperator1.value, form.controls.orgaoOperator2.value, form.controls.orgaoOperator3.value];
        request.values.orgaos = [form.controls.orgaoValue1.value, form.controls.orgaoValue2.value, form.controls.orgaoValue3.value];
      }

      request = this.formatData(request, form);
    })


    console.log(request);
    this.reportService.queryData(request).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.updateTableColumnsAndData(response);
        console.log(response);
      },
      error: (err) => {
        this.clearTable(this.dataSource, this.paginator);
        this.isSubmitting = false;
        this.requestError = true;
        this.errorMessage = "Não foi possível realizar a consulta, verifique os parâmetros e tente novamente";
      }
    });    
  }

  // Agrupa a informação separando pelo nome da tabela em questão
  addRequestInfo(request: any, form: any, table: any) {
    const tableName = table;

    if (!form.controls['func_agregada'].value) {
      request.order_by = {
        [tableName]: [
          form.controls.aggsParam.value,
          form.controls.orderBy.value
        ]
      }
    } else {
      request.func_agregada = {
        [tableName]: [
          form.controls.aggsParam.value,
          form.controls.func_agregada.value
        ]
      }
    }

    return request;
  }

  // Função utilizada para formatar os dados de ordenação e agregação
  formatData(request: any, form: any) {
    switch(form.controls.selectedAggsTable.value) {
      case "Deputados":
        return request = this.addRequestInfo(request, form, "deputados");

      case "Despesas":
        return request = this.addRequestInfo(request, form, "despesas");
      
      case "Evento":
        return request = this.addRequestInfo(request, form, "evento");
      
      case "Legislatura":
        return request = this.addRequestInfo(request, form, "legislatura");
      
      case "Orgaos":
        return request = this.addRequestInfo(request, form, "orgaos");
    }

    return request;
  }
}