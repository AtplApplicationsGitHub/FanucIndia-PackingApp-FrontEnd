import { DataTable, DataTableColumn } from "@/components/common/DataTable";
import { SalesOrder, LookupData } from "@/types/sales";
import { findName, formatDate } from "@/utils/sales-helpers";

type Props = {
  orders: SalesOrder[];
  lookup: LookupData;
  currentPage: number;
  pageSize: number;
  onEdit: (order: SalesOrder) => void;
  onDelete: (id: number) => void;
};

const SalesOrdersTable: React.FC<Props> = ({
  orders,
  lookup,
  currentPage,
  pageSize,
  onEdit,
  onDelete,
}) => {
  const columns: DataTableColumn<SalesOrder>[] = [
    {
      header: "S.I No",
      accessor: "id",
      render: (_, i) => (currentPage - 1) * pageSize + i + 1,
    },
    {
      header: "Product",
      accessor: "productId",
      render: (row) => findName(lookup.products, row.productId),
    },
    {
      header: "Sales No",
      accessor: "saleOrderNumber",
    },
    {
      header: "OB Delivery",
      accessor: "outboundDelivery",
    },
    {
      header: "Transfer",
      accessor: "transferOrder",
    },
    {
      header: "Req. Date",
      accessor: "deliveryDate",
      render: (row) => (row.deliveryDate ? formatDate(row.deliveryDate) : "-"),
    },
    {
      header: "Transporter",
      accessor: "transporterId",
      render: (row) => findName(lookup.transporters, row.transporterId),
    },
    {
      header: "Plant Code",
      accessor: "plantCodeId",
      render: (row) => findName(lookup.plantCodes, row.plantCodeId, "code"),
    },
    {
      header: "Pay",
      accessor: "paymentClearance",
      render: (row) => (row.paymentClearance ? "Yes" : "No"),
    },
    {
      header: "Sales Zone",
      accessor: "salesZoneId",
      render: (row) => findName(lookup.salesZones, row.salesZoneId),
    },
    {
      header: "Pack Config",
      accessor: "packConfigId",
      render: (row) =>
        findName(lookup.packConfigs, row.packConfigId, "configName"),
    },
    {
      header: "Customer",
      accessor: "customerId",
      render: row => findName(lookup.customers, row.customerId, "name"),
    },
    {
      header: "Remarks",
      accessor: "specialRemarks",
      render: (row) => row.specialRemarks || "-",
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => row.status || "-",
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={orders}
      rowActions={[
        {
          label: "Edit",
          onClick: onEdit,
        },
        {
          label: "Delete",
          onClick: (row) => onDelete(row.id),
          danger: true,
        },
      ]}
    />
  );
};

export default SalesOrdersTable;
