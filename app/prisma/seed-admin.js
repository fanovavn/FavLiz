// Seed RBAC: roles, permissions, and root admin — run with: node prisma/seed-admin.js
require("dotenv/config");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const RESOURCES = ["users", "items", "lists", "tags", "admins", "roles"];
const ACTIONS = ["read", "write", "delete"];

const ROLES = [
    {
        name: "Root Admin",
        slug: "root-admin",
        description: "Toàn quyền hệ thống",
        isSystem: true,
        permissions: RESOURCES.flatMap((r) => ACTIONS.map((a) => `${r}.${a}`)),
    },
    {
        name: "Admin",
        slug: "admin",
        description: "Quản lý content, không quản lý admin/roles",
        isSystem: true,
        permissions: ["users", "items", "lists", "tags"]
            .flatMap((r) => ACTIONS.map((a) => `${r}.${a}`))
            .concat(["admins.read", "roles.read"]),
    },
    {
        name: "Moderator",
        slug: "moderator",
        description: "Chỉ xem dữ liệu",
        isSystem: true,
        permissions: RESOURCES.map((r) => `${r}.read`),
    },
];

async function main() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    try {
        // 1. Upsert permissions
        console.log("📦 Seeding permissions...");
        const permIds = {};
        for (const resource of RESOURCES) {
            for (const action of ACTIONS) {
                const key = `${resource}.${action}`;
                const id = crypto.randomUUID();
                const desc = `${action} ${resource}`;
                const result = await pool.query(
                    `INSERT INTO permissions (id, resource, action, description)
                     VALUES ($1, $2, $3, $4)
                     ON CONFLICT (resource, action) DO UPDATE SET description = $4
                     RETURNING id`,
                    [id, resource, action, desc]
                );
                permIds[key] = result.rows[0].id;
            }
        }
        console.log(`  ✅ ${Object.keys(permIds).length} permissions ready`);

        // 2. Upsert roles and assign permissions
        console.log("🛡️  Seeding roles...");
        const roleIds = {};
        for (const role of ROLES) {
            const id = crypto.randomUUID();
            const result = await pool.query(
                `INSERT INTO admin_roles (id, name, slug, description, "isSystem")
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (slug) DO UPDATE SET name = $2, description = $4
                 RETURNING id`,
                [id, role.name, role.slug, role.description, role.isSystem]
            );
            const roleId = result.rows[0].id;
            roleIds[role.slug] = roleId;

            // Clear existing permissions for this role
            await pool.query(`DELETE FROM role_permissions WHERE "roleId" = $1`, [roleId]);

            // Assign permissions
            for (const permKey of role.permissions) {
                if (permIds[permKey]) {
                    await pool.query(
                        `INSERT INTO role_permissions ("roleId", "permissionId")
                         VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                        [roleId, permIds[permKey]]
                    );
                }
            }
            console.log(`  ✅ ${role.name} (${role.permissions.length} permissions)`);
        }

        // 3. Upsert root admin
        console.log("👤 Seeding root admin...");
        const hashedPw = await bcrypt.hash("Ting2004*", 12);
        const adminResult = await pool.query(
            `INSERT INTO admin_users (id, username, password, name, "isRoot", "isActive", "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, true, true, NOW(), NOW())
             ON CONFLICT (username) DO UPDATE SET password = $3, name = $4, "isRoot" = true
             RETURNING id`,
            [crypto.randomUUID(), "tientd", hashedPw, "Tien TD"]
        );
        const adminId = adminResult.rows[0].id;

        // Assign Root Admin role
        await pool.query(
            `INSERT INTO admin_user_roles ("adminUserId", "roleId")
             VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [adminId, roleIds["root-admin"]]
        );
        console.log("  ✅ Root admin 'tientd' with Root Admin role");

        console.log("\n🎉 RBAC seed completed!");
    } finally {
        await pool.end();
    }
}

main().catch(console.error);
