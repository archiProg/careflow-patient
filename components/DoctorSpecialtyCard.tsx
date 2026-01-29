import { DoctorSpecialtyModel } from "@/types/DoctorSpecialtyModel";
import { Text, View } from "react-native";

interface Props {
    specialty: DoctorSpecialtyModel;
}

const DoctorSpecialtyCard: React.FC<Props> = ({ specialty }) => {
    return (
        <View className="flex justify-center items-center rounded-xl p-6 bg-white shadow-xl border border-gray-100">
            <Text className="text-xl font-bold text-blue-500 mb-2">
                {specialty.name}
            </Text>
            <Text className="text-gray-600 leading-relaxed">
                {specialty.description}
            </Text>
        </View>
    );
};

export default DoctorSpecialtyCard;