// 메모리 데이터베이스 (MongoDB 없이 사용)
class MemoryDB {
    constructor() {
        this.users = [];
        this.properties = [];
        this.nextUserId = 1;
        this.nextPropertyId = 1;
    }

    // 사용자 관련 메서드
    createUser(userData) {
        const user = {
            _id: this.nextUserId++,
            ...userData,
            createdAt: new Date()
        };
        this.users.push(user);
        return user;
    }

    findUserByEmail(email) {
        return this.users.find(user => user.email === email);
    }

    findUserById(id) {
        return this.users.find(user => user._id === id);
    }

    updateUser(id, updateData) {
        const userIndex = this.users.findIndex(user => user._id === id);
        if (userIndex !== -1) {
            this.users[userIndex] = { ...this.users[userIndex], ...updateData };
            return this.users[userIndex];
        }
        return null;
    }

    // 매물 관련 메서드
    createProperty(propertyData) {
        const property = {
            _id: this.nextPropertyId++,
            ...propertyData,
            views: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.properties.push(property);
        return property;
    }

    findProperties(filter = {}) {
        let filteredProperties = this.properties.filter(property => property.status === '판매중');
        
        if (filter.propertyType) {
            filteredProperties = filteredProperties.filter(p => p.propertyType === filter.propertyType);
        }
        if (filter.dealType) {
            filteredProperties = filteredProperties.filter(p => p.dealType === filter.dealType);
        }
        if (filter.city) {
            filteredProperties = filteredProperties.filter(p => p.address.city === filter.city);
        }
        if (filter.district) {
            filteredProperties = filteredProperties.filter(p => p.address.district === filter.district);
        }
        if (filter.minPrice) {
            filteredProperties = filteredProperties.filter(p => p.price >= filter.minPrice);
        }
        if (filter.maxPrice) {
            filteredProperties = filteredProperties.filter(p => p.price <= filter.maxPrice);
        }
        if (filter.rooms) {
            filteredProperties = filteredProperties.filter(p => p.rooms === parseInt(filter.rooms));
        }

        return filteredProperties;
    }

    findPropertyById(id) {
        return this.properties.find(property => property._id === id);
    }

    updateProperty(id, updateData) {
        const propertyIndex = this.properties.findIndex(property => property._id === id);
        if (propertyIndex !== -1) {
            this.properties[propertyIndex] = { 
                ...this.properties[propertyIndex], 
                ...updateData,
                updatedAt: new Date()
            };
            return this.properties[propertyIndex];
        }
        return null;
    }

    deleteProperty(id) {
        const propertyIndex = this.properties.findIndex(property => property._id === id);
        if (propertyIndex !== -1) {
            return this.properties.splice(propertyIndex, 1)[0];
        }
        return null;
    }

    findPropertiesByBroker(brokerId) {
        return this.properties.filter(property => property.broker === brokerId);
    }

    incrementPropertyViews(id) {
        const property = this.properties.find(p => p._id === id);
        if (property) {
            property.views += 1;
            return property;
        }
        return null;
    }
}

// 싱글톤 인스턴스
const memoryDB = new MemoryDB();

module.exports = memoryDB;
