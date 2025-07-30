import { envVariables } from "../config/env";
import { userModel } from "../modules/user/user.model";
import { IsActive, Role } from "../modules/user/user.interface";
import bcrypt from 'bcryptjs';

// create an automate admin account to manage the user when the server is running for the first time
export const seedInitialAdmin = async () => {
    try {
        const isInitialAdminExists = await userModel.findOne({ email: envVariables.INITIAL_ADMIN_EMAIL });

        if (isInitialAdminExists) {
            console.log('Initial Admin already exists');
            return;
        }

        console.log('Seeding the Initial Admin...');

        const hashedPassword = await bcrypt.hash(envVariables.INITIAL_ADMIN_PASSWORD, parseInt(envVariables.BCRYPT_SALT_ROUNDS));

        const payload = {
            name: 'Initial Admin',
            email: envVariables.INITIAL_ADMIN_EMAIL,
            role: Role.ADMIN,
            password: hashedPassword,
            isActive: IsActive.ACTIVE,
            isVerified: true,
        }

        const initialAdmin = await userModel.create(payload);
        console.log('Initial Admin seeded successfully:', initialAdmin);

    } catch (error) {
        console.error('Error seeding admin:', error);
    }
}