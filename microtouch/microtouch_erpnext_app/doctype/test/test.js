// Copyright (c) 2024, Anwar Patel and contributors
// For license information, please see license.txt

frappe.ui.form.on("Test", {
	setup(frm) {
        frm.add_custom_button('Sales Invoice', function() {
            frappe.msgprint('Create Your Sales Invoice');
        });
	},
});
