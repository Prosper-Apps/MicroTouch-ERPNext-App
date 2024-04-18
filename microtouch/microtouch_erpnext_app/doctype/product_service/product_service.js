frappe.ui.form.on("Product Service", {
	onload_post_render: function (frm) {
		add_sales_invoice_button(frm)
	},
	warranty_status:function(frm){
		check_warranty(frm)
	},
	discount_on_amount: function(frm){
		compute_and_set_totals(frm);
	},
	min_service_charge:function(frm){
		compute_and_set_totals(frm);
	},
});
frappe.ui.form.on('Spares Parts', {
	quantity: function(frm){
		compute_and_set_totals(frm);
	},
	item_code: function(frm){
		compute_and_set_totals(frm);
	},
	price: function(frm){
		compute_and_set_totals(frm);
	},
	costing_table_remove: function(frm){
		compute_and_set_totals(frm);
	},
})
function compute_and_set_totals(frm) {
    let spare_total = 0;
	let discount_on_amount = frm.doc.discount_on_amount
    frm.doc.costing_table.forEach(item => {
        let total_price = item.quantity * item.price;
        frappe.model.set_value(item.doctype, item.name, 'total', total_price);
        spare_total += total_price;
    });

    // Calculate and set the total charges
    let min_service_charge = frm.doc.min_service_charge || 0;
    let sub_total = spare_total + min_service_charge;
	let total_Charges = sub_total - discount_on_amount

    frm.set_value('spare_part_total', spare_total);
    frm.set_value('sub_total', sub_total);
    frm.set_value('total_charges', total_Charges);
}
function add_sales_invoice_button(frm){
	frm.add_custom_button('Sales Invoice', function () {
		let product_data = {
			customer_name: frm.doc.customer_name,
			total_Charges: frm.doc.total_charges,
			discount: frm.doc.discount,
			spare_parts: frm.doc.costing_table.map(spare_part => ({
				item_code: spare_part.item_code,
				quantity: spare_part.quantity,
				price: spare_part.price,
				amount: spare_part.total
			}))
		};
		console.log(product_data.total_Charges);
		frappe.call({
			method: 'microtouch.microtouch_erpnext_app.doctype.product_service.product_service.make_sales_invoice',
			args: { product_data: product_data },
			callback: function (response) {
				let new_invoice = response.message
				if (new_invoice) {
					frappe.set_route('Form', 'Sales Invoice', new_invoice.name)
				}
			}
		})
	});
}
function check_warranty(frm) {
	if (frm.doc.warranty_status === 'Under Warranty') {
		frm.set_value('min_service_charge', 0);
		frm.set_value('sub_total', 0)
		frm.set_value('total_charges', 0)
	}
	else {
		frm.set_value('min_service_charge', 350)
	}
}

