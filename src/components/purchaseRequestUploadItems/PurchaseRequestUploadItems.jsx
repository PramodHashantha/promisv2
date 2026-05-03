import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { FiSearch } from "react-icons/fi";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import { purchaseRequestUploadItemsApi } from "@/utils/api/purchaseRequestUploadItems";

const PurchaseRequestUploadItems = () => {
  const [draftLoading, setDraftLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [draftPrList, setDraftPrList] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [notSavedItems, setNotSavedItems] = useState([]);
  const [selectedPr, setSelectedPr] = useState(null);
  const [budgetNos, setBudgetNos] = useState([]);
  const [uploadRows, setUploadRows] = useState([]);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [draftSearch, setDraftSearch] = useState("");
  const [savedItemsSearch, setSavedItemsSearch] = useState("");
  const [draftEntries, setDraftEntries] = useState(10);
  const [savedEntries, setSavedEntries] = useState(10);

  useEffect(() => {
    loadDraftPrs();
  }, []);

  const selectedPrNo = selectedPr?.PRNO || "";

  const hasSelection = useMemo(() => !!selectedPr?.SYS_ID, [selectedPr]);

  const filteredDraftPrList = useMemo(() => {
    const searchTerm = draftSearch.trim().toLowerCase();
    if (!searchTerm) return draftPrList;

    return draftPrList.filter((row) =>
      [row.PRNO, row.TITLE, row.DESCRIPTION].some((value) =>
        String(value ?? "").toLowerCase().includes(searchTerm)
      )
    );
  }, [draftPrList, draftSearch]);

  const filteredSavedItems = useMemo(() => {
    const searchTerm = savedItemsSearch.trim().toLowerCase();
    if (!searchTerm) return savedItems;

    return savedItems.filter((row) =>
      [row.PRNO, row.BUDGET_NO, row.ITEM_CODE, row.QTY, row.UNIT_PRICE].some((value) =>
        String(value ?? "").toLowerCase().includes(searchTerm)
      )
    );
  }, [savedItems, savedItemsSearch]);

  const visibleDraftPrList = useMemo(
    () => filteredDraftPrList.slice(0, draftEntries),
    [filteredDraftPrList, draftEntries]
  );

  const visibleSavedItems = useMemo(
    () => filteredSavedItems.slice(0, savedEntries),
    [filteredSavedItems, savedEntries]
  );

  const loadDraftPrs = async () => {
    try {
      setDraftLoading(true);
      const data = await purchaseRequestUploadItemsApi.getDraftPurchaseRequests();
      setDraftPrList(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire("Error", error.message || "Failed to load draft purchase requests.", "error");
    } finally {
      setDraftLoading(false);
    }
  };

  const loadItemsAndBudgets = async (pr) => {
    try {
      setDetailsLoading(true);
      setSelectedPr(pr);
      setSavedItems([]);
      setBudgetNos([]);
      setNotSavedItems([]);
      setUploadRows([]);
      setSelectedFileName("");
      setSavedItemsSearch("");

      const [items, budgets] = await Promise.all([
        purchaseRequestUploadItemsApi.getSavedItemsBySysId(pr.SYS_ID),
        purchaseRequestUploadItemsApi.getBudgetNosBySysId(pr.SYS_ID),
      ]);

      setSavedItems(Array.isArray(items) ? items : []);
      setBudgetNos(
        (Array.isArray(budgets) ? budgets : [])
          .map((x) => x.BUDGET_NO)
          .filter((x) => !!x)
      );
    } catch (error) {
      Swal.fire("Error", error.message || "Failed to load item and budget details.", "error");
    } finally {
      setDetailsLoading(false);
    }
  };

  const downloadTemplate = async () => {
    if (!selectedPrNo) {
      Swal.fire("Warning", "Please select a PR No.", "warning");
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();

      const templateSheet = workbook.addWorksheet("PRItemList");
      templateSheet.columns = [
        { header: "PRNo", key: "PRNo", width: 25 },
        { header: "BudgetItemNo", key: "BudgetItemNo", width: 25 },
        { header: "ItemCode", key: "ItemCode", width: 25 },
        { header: "Qty", key: "Qty", width: 15 },
        { header: "UnitPrice", key: "UnitPrice", width: 15 },
      ];
      templateSheet.addRow({
        PRNo: selectedPrNo,
        BudgetItemNo: "",
        ItemCode: "",
        Qty: 0,
        UnitPrice: 0,
      });

      const budgetSheet = workbook.addWorksheet("BudgetItemNoList");
      budgetSheet.columns = [{ header: "BudgetItemNoList", key: "BudgetItemNoList", width: 30 }];
      budgetNos.forEach((b) => budgetSheet.addRow({ BudgetItemNoList: b }));

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, `PRItemUpload_${selectedPrNo}.xlsx`);
    } catch (error) {
      Swal.fire("Error", "Failed to generate Excel template.", "error");
    }
  };

  const onFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const workbook = new ExcelJS.Workbook();
      const buffer = await file.arrayBuffer();
      await workbook.xlsx.load(buffer);

      const sheet = workbook.worksheets[0];
      if (!sheet) {
        setUploadRows([]);
        setSelectedFileName("");
        Swal.fire("Warning", "Uploaded file has no worksheet.", "warning");
        return;
      }

      const headers = [];
      sheet.getRow(1).eachCell((cell) => headers.push(String(cell.value ?? "").trim()));

      const data = [];
      for (let rowIndex = 2; rowIndex <= sheet.rowCount; rowIndex += 1) {
        const row = sheet.getRow(rowIndex);
        const item = {};
        let hasValue = false;

        headers.forEach((header, idx) => {
          const rawValue = row.getCell(idx + 1).value;
          const normalizedValue =
            typeof rawValue === "object" && rawValue !== null && "result" in rawValue
              ? rawValue.result
              : rawValue;
          const value = normalizedValue ?? "";
          item[header] = value;
          if (String(value).trim() !== "") hasValue = true;
        });

        if (hasValue) data.push(item);
      }

      setUploadRows(data);
      setSelectedFileName(file.name);
    } catch (error) {
      setUploadRows([]);
      setSelectedFileName("");
      Swal.fire("Error", "Failed to read Excel file.", "error");
    }
  };

  const uploadExcelData = async () => {
    if (!selectedPr?.SYS_ID) {
      Swal.fire("Warning", "Please select a PR No.", "warning");
      return;
    }
    if (!uploadRows.length) {
      Swal.fire("Warning", "Please select a valid Excel file.", "warning");
      return;
    }

    try {
      setUploading(true);
      const payload = {
        sysId: selectedPr.SYS_ID,
        pRequestItemDetailsUd: uploadRows.map((x) => ({
          prNo: x.PRNo ?? x.PRNO ?? "",
          budgetItemNo: x.BudgetItemNo ?? x.BUDGETITEMNO ?? "",
          itemCode: x.ItemCode ?? x.ITEMCODE ?? "",
          qty: Number(x.Qty ?? x.QTY ?? 0),
          unitPrice: Number(x.UnitPrice ?? x.UNITPRICE ?? 0),
        })),
      };

      const result = await purchaseRequestUploadItemsApi.uploadItems(payload);
      setNotSavedItems(result?.notSavedItems || []);

      if ((result?.resultType || 0) === 1) {
        Swal.fire("Success", result?.message || "Items uploaded successfully.", "success");
        if (selectedPr?.SYS_ID) {
          const refreshedItems = await purchaseRequestUploadItemsApi.getSavedItemsBySysId(
            selectedPr.SYS_ID
          );
          setSavedItems(Array.isArray(refreshedItems) ? refreshedItems : []);
        }
        setUploadRows([]);
        setSelectedFileName("");
      } else {
        Swal.fire("Warning", result?.message || "Upload completed with warnings.", "warning");
      }
    } catch (error) {
      Swal.fire("Error", error.message || "Upload failed.", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card">
      
      <div className="card-header">
        <h5>Drafted Purchase Requests</h5>
      </div>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
          <div className="d-flex align-items-center gap-2 text-uppercase text-muted small fw-semibold">
            <span>Show</span>
            <select
              className="form-select form-select-sm rounded-3 px-3"
              style={{ width: "56px", height: "45px" }}
              value={draftEntries}
              onChange={(event) => setDraftEntries(Number(event.target.value))}
              disabled={draftLoading}
            >
              {[10, 20, 30, 50].map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
            <span>Entries</span>
          </div>

          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              className="pl-9 pr-4 py-1.5 text-sm border border-slate-200 rounded-3 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-400"
              style={{ width: "245px", height: "40px", paddingLeft:"40px" }}
              placeholder="Search records..."
              value={draftSearch}
              onChange={(event) => setDraftSearch(event.target.value)}
              disabled={draftLoading}
            />
          </div>
        </div>

        <div className="table-responsive mb-4">
          {draftLoading ? (
            <TableSkeleton columns={4} rows={6} />
          ) : (
            <table className="table table-bordered table-striped table-hover">
              <thead>
                <tr>
                  <th>PR No</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleDraftPrList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-muted">
                      {draftSearch ? "No matching data found" : "No data to load"}
                    </td>
                  </tr>
                ) : (
                  visibleDraftPrList.map((row) => (
                    <tr key={row.SYS_ID}>
                      <td>{row.PRNO}</td>
                      <td>{row.TITLE}</td>
                      <td>{row.DESCRIPTION}</td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          type="button"
                          onClick={() => loadItemsAndBudgets(row)}
                          disabled={detailsLoading || uploading}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
          
        <h5 style={{ color: "#51c13c" }} className="mt-3">Saved Item List</h5>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3 mt-3">
          <div className="d-flex align-items-center gap-2 text-uppercase text-muted small fw-semibold">
            <span>Show</span>
            <select
              className="form-select form-select-sm rounded-3 px-3"
              style={{ width: "56px", height: "45px" }}
              value={savedEntries}
              onChange={(event) => setSavedEntries(Number(event.target.value))}
              disabled={detailsLoading}
            >
              {[10, 20, 30, 50].map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
            <span>Entries</span>
          </div>

          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              className="pl-9 pr-4 py-1.5 text-sm border border-slate-200 rounded-3 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-400"
              style={{ width: "245px", height: "40px", paddingLeft:"40px"  }}
              placeholder="Search records..."
              value={savedItemsSearch}
              onChange={(event) => setSavedItemsSearch(event.target.value)}
              disabled={detailsLoading}
            />
          </div>
        </div>
        <div className="table-responsive mb-4">
          {detailsLoading ? (
            <TableSkeleton columns={5} rows={6} />
          ) : (
            <table className="table table-bordered table-striped table-hover">
              <thead>
                <tr>
                  <th>PR No</th>
                  <th>Budget Item No</th>
                  <th>Item Code</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                </tr>
              </thead>
              <tbody>
                {visibleSavedItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-muted">
                      {savedItemsSearch ? "No matching data found" : "No data to load"}
                    </td>
                  </tr>
                ) : (
                  visibleSavedItems.map((row, idx) => (
                    <tr key={`${row.ITEM_CODE}-${idx}`}>
                      <td>{row.PRNO}</td>
                      <td>{row.BUDGET_NO}</td>
                      <td>{row.ITEM_CODE}</td>
                      <td>{row.QTY}</td>
                      <td>{row.UNIT_PRICE}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="mb-3">
          <label className="me-2">Download Excel Template from here:</label>
          <button
            className="btn btn-sm btn-primary"
            type="button"
            onClick={downloadTemplate}
            disabled={!hasSelection || uploading || detailsLoading}
          >
            Download
          </button>
        </div>

        <div className="mb-4 d-flex align-items-center gap-2 flex-wrap">
          <label className="me-2 mb-0">File Location:</label>
          <input
            type="file"
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={onFileChange}
            disabled={!hasSelection || uploading || detailsLoading}
          />
          <button
            className="btn btn-sm btn-success"
            type="button"
            onClick={uploadExcelData}
            disabled={!hasSelection || uploading || detailsLoading}
          >
            Upload
          </button>
          {selectedFileName ? <span className="text-muted">{selectedFileName}</span> : null}
        </div>

        <h5 style={{ color: "#ec514c" }}>Items Not Saved</h5>
        <div className="table-responsive">
          <table className="table table-bordered table-striped table-hover">
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Error Description</th>
              </tr>
            </thead>
            <tbody>
              {notSavedItems.length === 0 ? (
                <tr>
                  <td colSpan={2} className="text-center text-muted">
                    No data to load
                  </td>
                </tr>
              ) : (
                notSavedItems.map((row, idx) => (
                  <tr key={`${row.ITEM_CODE}-${idx}`}>
                    <td>{row.ITEM_CODE}</td>
                    <td>{row.ERROR_MSG}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PurchaseRequestUploadItems;
