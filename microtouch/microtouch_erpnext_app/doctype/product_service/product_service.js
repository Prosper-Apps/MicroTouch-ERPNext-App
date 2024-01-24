function check_warranty(frm) {
	if (frm.doc.warranty_status === 'Under Warranty') {
		frm.set_value('min_service_charge', 0);
		frm.set_value('sub_total',0)
		frm.set_value('total_charges',0)
	}
	else{
		frm.set_value('min_service_charge',350)
	}
}
function calculate_total(frm, cdt, cdn){
	let child = locals[cdt][cdn]
	let total_price = child.quantity * child.price
	frappe.model.set_value(cdt,cdn,'total',total_price)
}
function calling_calculate_total(frm, cdt,cdn){
	calculate_total(frm,cdt,cdn)
	frm.compute_total(frm)
}
function on_remove_cal_total (frm,cdt,cdn){
	frm.compute_total(frm)
	frm.on_discount_per_cal_total(frm)
	frm.on_discount_amount_cal_total(frm)
}
function on_discount_per_cal_total(frm){
	let sub_total = frm.doc.sub_total
	let discount_amount = (frm.doc.discount/100) * sub_total
	let total_charges_after_discount_on_percen = sub_total -discount_amount
	frm.set_value('total_charges',total_charges_after_discount_on_percen)
}

function on_discount_amount_cal_total (frm){
	let discount_amount = frm.doc.discount_on_amount
	let sub_total = frm.doc.sub_total
	let total_charges_after_discount_on_amount = sub_total - discount_amount
	frm.set_value('total_charges',total_charges_after_discount_on_amount)
}
// Copyright (c) 2023, Anwar Patel and contributors
// For license information, please see license.txt
frappe.ui.form.on("Product Service", {
	setup:function (frm){
		frm.compute_total = (frm)=>{
			let min_service_charge = frm.doc.min_service_charge
			let discount =frm.doc.discount
			let spare_total = 0
			frm.doc.costing_table.forEach(price => {
				spare_total += price.total
			});
			let sub_total = spare_total + min_service_charge
			frm.set_value('spare_part_total',spare_total)
			frm.set_value('sub_total',sub_total)
			frm.set_value('total_charges',sub_total)	
		}; 
	},

	refresh: function (frm){
		frm.add_custom_button('Sales Invoice', function() {
			let product_data = {
				customer_name:frm.doc.customer_name,
				total_Charges:frm.doc.total_charges,
				discount:frm.doc.discount,
				spare_parts:cur_frm.doc.costing_table.map(spare_part=>({
					item_code:spare_part.item_code,
					quantity:spare_part.quantity,
					price:spare_part.price,
					amount:spare_part.total
				}))
			};
			console.log(product_data.total_Charges);
			frappe.call({
				method :'microtouch.microtouch_erpnext_app.doctype.product_service.product_service.make_sales_invoice',
				args:{product_data:product_data},
				callback: function (response){
					let new_invoice = response.message
					if(new_invoice){
						frappe.set_route('Form','Sales Invoice',new_invoice.name)
					}
				} 
			})
        });
	},
	discount: on_discount_per_cal_total,
	warranty_status:check_warranty,
	discount_on_amount: on_discount_amount_cal_total
});
frappe.ui.form.on('Spares Parts',{
	quantity:calling_calculate_total,
	item_code:calling_calculate_total,
	price:calling_calculate_total,
	costing_table_remove:on_remove_cal_total
})

