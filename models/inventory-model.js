const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}



/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

/* ***************************
 *  Get all inventory item by inv_id
 * ************************** */
async function getDetailByInventoryId(inventory_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory
      WHERE inv_id = $1`,
      [inventory_id]
    )
    return data.rows[0]
  } catch (error) {
    console.error("getinventorybyid error " + error)
  }
}

/* **********************
 *   Insert new classification
 * ********************* */
async function addClassification(classification_name) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *"
    const data = await pool.query(sql, [classification_name])
    return data.rows[0]
  } catch (error) {
    console.error("addclassifcation error" + error)
  }
}

async function addInventory(
  classification_id,
  inv_make,
  inv_model,
  inv_year,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_miles,
  inv_color
) {
  try {
    const sql = `
      INSERT INTO inventory (
        classification_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *;
    `
    return await pool.query(sql, [
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
    ])
  } catch (error) {
    console.error("addInventory error", error)
    throw error
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
  inv_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
 async function deleteInventoryItem(inv_id) {
  try {
    const sql = 'DELETE FROM inventory WHERE inv_id = $1'
    const data = await pool.query(sql, [inv_id])
  return data
  } catch (error) {
    new Error("Delete Inventory Error")
  }
}

/* ***************************
 *  Advanced Filter Inventory
 * ************************** */
async function filterInventory({ minPrice, maxPrice, classification_id, minYear, maxYear, name }) {
  try {
    let query = `SELECT * FROM public.inventory AS i
                 JOIN public.classification AS c 
                 ON i.classification_id = c.classification_id
                 WHERE 1=1`;
    const params = [];
    let i = 1;

    if (minPrice) {
      query += ` AND i.inv_price >= $${i++}`;
      params.push(minPrice);
    }
    if (maxPrice) {
      query += ` AND i.inv_price <= $${i++}`;
      params.push(maxPrice);
    }
    if (classification_id) {
      query += ` AND i.classification_id = $${i++}`;
      params.push(classification_id);
    }
    if (minYear) {
      query += ` AND i.inv_year >= $${i++}`;
      params.push(minYear);
    }
    if (maxYear) {
      query += ` AND i.inv_year <= $${i++}`;
      params.push(maxYear);
    }
    if (name) {
      query += ` AND (i.inv_make ILIKE $${i} OR i.inv_model ILIKE $${i})`;
      params.push(`%${name}%`);
      i++;
    }

    query += ` ORDER BY i.inv_price ASC`;

    const data = await pool.query(query, params);
    return data.rows;
  } catch (error) {
    console.error("filterInventory error: " + error);
    throw error;
  }
}

module.exports = {
  getClassifications, 
  getInventoryByClassificationId, 
  getDetailByInventoryId, 
  addClassification, 
  addInventory, 
  updateInventory, 
  deleteInventoryItem,
  filterInventory
};